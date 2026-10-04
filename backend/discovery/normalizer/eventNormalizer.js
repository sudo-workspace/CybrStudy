/**
 * Event Normalizer
 * Enforces canonical schema, consistent mode/dates/locations/currencies,
 * and dynamic lifecycle status.
 */

export function normalizeEvent(event) {
  if (!event) return null;

  // 1. Normalize Mode
  const rawMode = String(event.mode || '').toLowerCase();
  let mode = 'unknown';
  if (
    rawMode.includes('hybrid') ||
    rawMode.includes('both') ||
    rawMode.includes('online + offline')
  ) {
    mode = 'hybrid';
  } else if (
    rawMode.includes('online') ||
    rawMode.includes('virtual') ||
    rawMode.includes('remote') ||
    rawMode.includes('digital')
  ) {
    mode = 'virtual';
  } else if (
    rawMode.includes('offline') ||
    rawMode.includes('in-person') ||
    rawMode.includes('physical') ||
    rawMode.includes('on campus') ||
    rawMode.includes('onsite') ||
    rawMode.includes('in person')
  ) {
    mode = 'physical';
  } else if (event.location?.city || event.location?.venue) {
    mode = 'physical';
  } else {
    mode = 'virtual';
  }

  // 2. Normalize Dates
  const startDate = parseDate(event.dates?.start);
  const endDate = parseDate(event.dates?.end) || startDate;
  const regDeadline = parseDate(event.dates?.registrationDeadline) || startDate;

  // 3. Normalize Location
  const city = cleanLocationName(event.location?.city);
  const state = cleanLocationName(event.location?.state);
  let country = cleanLocationName(event.location?.country);

  if (!country && (city || state)) {
    country = 'India';
  }
  if (mode === 'virtual' && !city && !state && !country) {
    country = 'Worldwide';
  }

  // 4. Compute Event Lifecycle Status
  const status = computeEventStatus({ startDate, endDate, regDeadline });

  // 5. Normalize Categories & Tech
  const categories = normalizeCategories(event.categories, event.title, event.description);
  const technologies = [...new Set((event.technologies || []).map((t) => String(t).trim()).filter(Boolean))];

  // 6. Normalize Currency & Prize
  let currency = event.prize?.currency || 'INR';
  if (currency.toLowerCase().includes('rupee') || currency === '₹') currency = 'INR';
  if (currency.toLowerCase().includes('dollar') || currency === '$') currency = 'USD';

  const prizeAmount = typeof event.prize?.amount === 'number' && !isNaN(event.prize.amount)
    ? event.prize.amount
    : null;

  let prizeDesc = event.prize?.description;
  if (!prizeDesc && prizeAmount) {
    prizeDesc = `${currency === 'INR' ? '₹' : currency + ' '}${prizeAmount.toLocaleString()}`;
  }

  const nowIso = new Date().toISOString();

  return {
    title: String(event.title || '').trim(),
    description: String(event.description || '').trim(),
    organizer: {
      name: String(event.organizer?.name || 'Hackathon Host').trim(),
      website: String(event.organizer?.website || event.registrationUrl || '').trim(),
    },
    dates: {
      start: startDate,
      end: endDate,
      registrationDeadline: regDeadline,
    },
    mode,
    location: {
      city: city || null,
      state: state || null,
      country: country || null,
      venue: event.location?.venue ? String(event.location.venue).trim() : (city ? `${city}, ${state || country}` : 'Virtual / Online'),
    },
    eligibility: {
      countries: Array.isArray(event.eligibility?.countries) && event.eligibility.countries.length > 0
        ? event.eligibility.countries
        : (mode === 'virtual' ? ['Worldwide'] : [country || 'India']),
      studentOnly: Boolean(event.eligibility?.studentOnly ?? true),
      ageRestriction: event.eligibility?.ageRestriction || null,
      universityRestriction: event.eligibility?.universityRestriction || null,
    },
    categories,
    technologies,
    teamSize: {
      minimum: Math.max(1, Number(event.teamSize?.minimum) || 1),
      maximum: Math.max(1, Number(event.teamSize?.maximum) || 4),
    },
    prize: {
      amount: prizeAmount,
      currency,
      description: prizeDesc || null,
    },
    registrationUrl: String(event.registrationUrl || '').trim(),
    source: {
      name: event.source?.name || 'Web Discovery',
      url: event.source?.url || event.registrationUrl || '',
      type: event.source?.type || 'api',
    },
    sources: [
      {
        name: event.source?.name || 'Web Discovery',
        url: event.source?.url || event.registrationUrl || '',
      },
    ],
    status,
    featured: Boolean(event.featured || false),
    discovery: {
      firstSeen: event.discovery?.firstSeen || nowIso,
      lastChecked: nowIso,
      lastUpdated: nowIso,
    },
  };
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

function cleanLocationName(str) {
  if (!str || typeof str !== 'string') return null;
  const clean = str.trim().replace(/\s+/g, ' ');
  if (['n/a', 'none', 'null', 'undefined', 'online', 'virtual'].includes(clean.toLowerCase())) {
    return null;
  }
  return clean;
}

function computeEventStatus({ startDate, endDate, regDeadline }) {
  const now = Date.now();
  const startMs = startDate ? new Date(startDate).getTime() : null;
  const endMs = endDate ? new Date(endDate).getTime() : null;
  const deadlineMs = regDeadline ? new Date(regDeadline).getTime() : null;

  if (endMs && now > endMs) {
    return 'completed';
  }
  if (startMs && endMs && now >= startMs && now <= endMs) {
    return 'ongoing';
  }
  if (deadlineMs && now > deadlineMs) {
    return 'registration_closed';
  }
  if (deadlineMs && now <= deadlineMs) {
    return 'registration_open';
  }
  return 'upcoming';
}

function normalizeCategories(rawList = [], title = '', desc = '') {
  const combined = [
    ...(rawList || []),
    title,
    desc,
  ].join(' ').toLowerCase();

  const matched = new Set();

  if (combined.includes('cyber') || combined.includes('security') || combined.includes('ctf') || combined.includes('crypt')) {
    matched.add('Cybersecurity');
  }
  if (combined.includes('ai') || combined.includes('artificial intelligence') || combined.includes('machine learning') || combined.includes('deep learning')) {
    matched.add('AI / ML');
  }
  if (combined.includes('web3') || combined.includes('blockchain') || combined.includes('crypto') || combined.includes('ethereum') || combined.includes('solana')) {
    matched.add('Web3');
  }
  if (combined.includes('cloud') || combined.includes('devops') || combined.includes('aws') || combined.includes('kubernetes')) {
    matched.add('Cloud');
  }
  if (combined.includes('open source') || combined.includes('oss')) {
    matched.add('Open Source');
  }
  if (combined.includes('iot') || combined.includes('hardware') || combined.includes('robotics')) {
    matched.add('IoT & Hardware');
  }
  if (combined.includes('web') || combined.includes('frontend') || combined.includes('full stack')) {
    matched.add('Web Dev');
  }
  if (combined.includes('mobile') || combined.includes('android') || combined.includes('flutter') || combined.includes('ios')) {
    matched.add('Mobile');
  }

  // Preserve existing specific tags if relevant
  (rawList || []).forEach((c) => {
    const s = String(c).trim();
    if (s && s.length <= 25) matched.add(s);
  });

  if (matched.size === 0) {
    matched.add('Open Innovation');
  }

  return Array.from(matched).slice(0, 5);
}
