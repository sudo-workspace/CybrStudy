import { SourceRegistry } from '../sources/registry.js';
import { extractIntermediateEvent } from '../extractors/eventExtractor.js';
import { normalizeEvent } from '../normalizer/eventNormalizer.js';
import { classifyEvent } from '../classifier/eventClassifier.js';
import { validateEvent } from '../validator/eventValidator.js';
import { generateEventFingerprint } from '../deduplicator/eventDeduplicator.js';
import { syncEventsToFirestore } from '../firestore/firestoreSync.js';

/**
 * Executes the entire Discovery Pipeline end-to-end:
 * Sources -> Fetch -> Extract -> Normalize -> Classify -> Validate -> Deduplicate -> Firestore Sync
 * 
 * @param {object} [options]
 * @param {any} [options.db] Firestore database instance (if syncing to Firestore)
 * @returns {Promise<object>} Discovery run summary and processed events
 */
export async function executeDiscoveryPipeline(options = {}) {
  const startTime = Date.now();
  const registry = new SourceRegistry();
  const sources = registry.getEnabled();

  const metrics = {
    sourcesChecked: sources.length,
    sourcesSuccessful: 0,
    sourcesFailed: 0,
    discoveredCount: 0,
    acceptedCount: 0,
    duplicateCount: 0,
    rejectedCount: 0,
    durationMs: 0,
    sourcesSummary: [],
    errors: [],
  };

  const rawDiscoveredEvents = [];

  // 1. Fetch & Extract across sources with isolated error boundaries
  for (const source of sources) {
    try {
      const res = await source.run();
      const count = res.events?.length || 0;
      metrics.sourcesSuccessful++;
      metrics.discoveredCount += count;
      metrics.sourcesSummary.push({
        name: source.name,
        type: source.type,
        status: 'success',
        count,
      });

      for (const raw of (res.events || [])) {
        rawDiscoveredEvents.push({
          raw,
          sourceMetadata: { name: source.name, url: source.url, type: source.type },
        });
      }
    } catch (err) {
      metrics.sourcesFailed++;
      const errMsg = `[${source.name}] Discovery failed: ${err.message}`;
      metrics.errors.push(errMsg);
      metrics.sourcesSummary.push({
        name: source.name,
        type: source.type,
        status: 'failed',
        count: 0,
        error: err.message,
      });
      console.warn(errMsg);
      // Continuous execution: do not let one failing source stop others
    }
  }

  // 2. Extract, Normalize, Classify, Validate & Deduplicate
  const fingerprintMap = new Map();
  const validProcessedEvents = [];

  for (const item of rawDiscoveredEvents) {
    try {
      const intermediate = extractIntermediateEvent(item.raw, item.sourceMetadata);
      if (!intermediate) {
        metrics.rejectedCount++;
        continue;
      }

      const normalized = normalizeEvent(intermediate);
      if (!normalized) {
        metrics.rejectedCount++;
        continue;
      }

      const classified = classifyEvent(normalized);
      const validation = validateEvent(classified);

      if (!validation.valid) {
        metrics.rejectedCount++;
        continue;
      }

      const fingerprint = generateEventFingerprint(classified);
      classified.fingerprint = fingerprint;

      if (fingerprintMap.has(fingerprint)) {
        // Duplicate detected within same run
        metrics.duplicateCount++;
        const existing = fingerprintMap.get(fingerprint);
        if (classified.source?.name && !existing.sources.some((s) => s.name === classified.source.name)) {
          existing.sources.push({ name: classified.source.name, url: classified.source.url });
        }
      } else {
        fingerprintMap.set(fingerprint, classified);
        validProcessedEvents.push(classified);
      }
    } catch (err) {
      metrics.rejectedCount++;
      metrics.errors.push(`Processing error: ${err.message}`);
    }
  }

  metrics.acceptedCount = validProcessedEvents.length;
  metrics.durationMs = Date.now() - startTime;

  // 3. Sync to Firestore if db instance is provided
  let firestoreResult = null;
  if (options.db) {
    try {
      firestoreResult = await syncEventsToFirestore(options.db, validProcessedEvents, metrics);
    } catch (syncErr) {
      console.warn('[Discovery Engine] Firestore sync failed:', syncErr.message);
      metrics.errors.push(`Firestore sync failed: ${syncErr.message}`);
    }
  }

  // 4. Log clean summary (Section 23)
  console.log(`
==================================================
CybrStudy 24/7 Hackathon Discovery Engine
Run Completed in ${(metrics.durationMs / 1000).toFixed(2)}s
==================================================
Sources Checked:    ${metrics.sourcesChecked}
Successful:         ${metrics.sourcesSuccessful}
Failed:             ${metrics.sourcesFailed}

Discovered Events:  ${metrics.discoveredCount}
Accepted (Unique):  ${metrics.acceptedCount}
Duplicates Merged:  ${metrics.duplicateCount}
Rejected/Junk:      ${metrics.rejectedCount}
==================================================
  `);

  return {
    metrics,
    events: validProcessedEvents,
    firestoreResult,
  };
}

// Standalone CLI execution support
const isDirectExecution = typeof process !== 'undefined' && process.argv && process.argv[1] && (
  import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` ||
  process.argv[1].replace(/\\/g, '/').endsWith('backend/discovery/scheduler/runDiscovery.js')
);

if (isDirectExecution) {
  executeDiscoveryPipeline()
    .then((res) => {
      console.log(`Successfully completed discovery. Found ${res.events.length} valid events.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Discovery Engine Fatal Error:', err);
      process.exit(1);
    });
}

