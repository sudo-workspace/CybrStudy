import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * Syncs processed events to Firestore collection 'hackathons'
 * and records discovery metrics to 'sourceRuns'.
 */
export async function syncEventsToFirestore(db, processedEvents, runMetrics = {}) {
  const hackathonsRef = collection(db, 'hackathons');
  const sourceRunsRef = collection(db, 'sourceRuns');

  // 1. Fetch current hackathons to index existing fingerprints
  const existingDocsSnap = await getDocs(hackathonsRef);
  const existingMap = new Map();
  existingDocsSnap.forEach((docSnap) => {
    const data = docSnap.data();
    const fp = data.fingerprint || docSnap.id;
    existingMap.set(fp, { id: docSnap.id, ...data });
  });

  let createdCount = 0;
  let updatedCount = 0;

  // 2. Upsert each processed event
  for (const event of processedEvents) {
    const docId = event.fingerprint;
    const existing = existingMap.get(docId);

    if (existing) {
      // Merge sources and update lastChecked/status
      const mergedSources = [...(existing.sources || [])];
      if (event.source?.name && !mergedSources.some((s) => s.name === event.source.name)) {
        mergedSources.push({ name: event.source.name, url: event.source.url });
      }

      await updateDoc(doc(hackathonsRef, docId), {
        status: event.status,
        sources: mergedSources,
        'discovery.lastChecked': new Date().toISOString(),
        'discovery.lastUpdated': new Date().toISOString(),
      });
      updatedCount++;
    } else {
      // Insert new document
      await setDoc(doc(hackathonsRef, docId), {
        ...event,
        createdAt: serverTimestamp(),
      });
      existingMap.set(docId, event);
      createdCount++;
    }
  }

  // 3. Record discovery run metrics in sourceRuns collection
  const runRecord = {
    timestamp: serverTimestamp(),
    isoTimestamp: new Date().toISOString(),
    sourcesChecked: runMetrics.sourcesChecked || 0,
    sourcesSuccessful: runMetrics.sourcesSuccessful || 0,
    sourcesFailed: runMetrics.sourcesFailed || 0,
    discoveredCount: runMetrics.discoveredCount || 0,
    acceptedCount: createdCount,
    duplicateCount: updatedCount,
    rejectedCount: runMetrics.rejectedCount || 0,
    durationMs: runMetrics.durationMs || 0,
    sources: runMetrics.sourcesSummary || [],
    errors: runMetrics.errors || [],
  };

  const runDocId = `run_${Date.now()}`;
  await setDoc(doc(sourceRunsRef, runDocId), runRecord);

  return {
    createdCount,
    updatedCount,
    runRecord,
  };
}
