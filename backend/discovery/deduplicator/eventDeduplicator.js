// Fast 64-bit deterministic hash for universal environments (Node & Browser)
function stringHash(str) {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/**
 * Event Deduplicator
 * Generates stable deterministic fingerprints and detects duplicates across sources.
 */

export function generateEventFingerprint(event) {
  // Normalize title: remove punctuation, lowercase, collapse spaces
  const cleanTitle = (event.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();

  // Normalize date down to year-month
  let datePart = '';
  if (event.dates?.start) {
    datePart = event.dates.start.slice(0, 7); // '2026-10'
  } else if (event.dates?.registrationDeadline) {
    datePart = event.dates.registrationDeadline.slice(0, 7);
  }

  // Domain or slug from registration URL
  let domainPart = '';
  try {
    if (event.registrationUrl) {
      const u = new URL(event.registrationUrl);
      domainPart = u.hostname.replace('www.', '');
      // If it's a devfolio/unstop slug, include the path
      if (domainPart.includes('devfolio.co') || domainPart.includes('unstop.com')) {
        domainPart += u.pathname.replace(/\/$/, '');
      }
    }
  } catch {
    domainPart = '';
  }

  const rawKey = `${cleanTitle}::${datePart}::${domainPart}`;
  return `hk_${stringHash(rawKey)}`;
}

/**
 * Merge secondary source data into existing event
 */
export function mergeEventSources(existingEvent, newEvent) {
  const mergedSources = [...(existingEvent.sources || [])];
  const newSourceName = newEvent.source?.name;

  const alreadyRecorded = mergedSources.some((s) => s.name === newSourceName);
  if (!alreadyRecorded && newEvent.source) {
    mergedSources.push({
      name: newEvent.source.name,
      url: newEvent.source.url || newEvent.registrationUrl,
    });
  }

  // Preserve better data: e.g. prize description or detailed description
  const description = (existingEvent.description && existingEvent.description.length > 50)
    ? existingEvent.description
    : (newEvent.description || existingEvent.description);

  const prize = existingEvent.prize?.amount
    ? existingEvent.prize
    : (newEvent.prize?.amount ? newEvent.prize : existingEvent.prize);

  return {
    ...existingEvent,
    description,
    prize,
    sources: mergedSources,
    discovery: {
      ...existingEvent.discovery,
      lastChecked: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
  };
}
