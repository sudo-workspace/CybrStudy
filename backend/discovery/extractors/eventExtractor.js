/**
 * Event Extractor: Sanitizes and standardizes intermediate event payload fields.
 */
export function extractIntermediateEvent(rawEvent, sourceMetadata = {}) {
  if (!rawEvent || typeof rawEvent !== 'object') return null;

  const title = (rawEvent.title || rawEvent.name || '').trim();
  if (!title) return null;

  return {
    title,
    description: (rawEvent.description || rawEvent.tagline || rawEvent.desc || '').trim(),
    organizer: {
      name: rawEvent.organizer?.name || rawEvent.edition_name || 'Hackathon Host',
      website: rawEvent.organizer?.website || rawEvent.registrationUrl || '',
    },
    dates: {
      start: rawEvent.dates?.start || rawEvent.starts_at || null,
      end: rawEvent.dates?.end || rawEvent.ends_at || null,
      registrationDeadline: rawEvent.dates?.registrationDeadline || rawEvent.reg_ends_at || null,
    },
    mode: rawEvent.mode || (rawEvent.is_online ? 'virtual' : 'physical'),
    location: {
      city: rawEvent.location?.city || rawEvent.city || null,
      state: rawEvent.location?.state || rawEvent.state || null,
      country: rawEvent.location?.country || rawEvent.country || null,
      venue: rawEvent.location?.venue || rawEvent.venue || null,
    },
    eligibility: {
      countries: Array.isArray(rawEvent.eligibility?.countries) ? rawEvent.eligibility.countries : [],
      studentOnly: rawEvent.eligibility?.studentOnly ?? true,
      ageRestriction: rawEvent.eligibility?.ageRestriction || null,
      universityRestriction: rawEvent.eligibility?.universityRestriction || null,
    },
    categories: Array.isArray(rawEvent.categories) ? rawEvent.categories : [],
    technologies: Array.isArray(rawEvent.technologies) ? rawEvent.technologies : [],
    teamSize: {
      minimum: rawEvent.teamSize?.minimum || 1,
      maximum: rawEvent.teamSize?.maximum || 4,
    },
    prize: {
      amount: rawEvent.prize?.amount || null,
      currency: rawEvent.prize?.currency || 'INR',
      description: rawEvent.prize?.description || null,
    },
    registrationUrl: (rawEvent.registrationUrl || rawEvent.url || '').trim(),
    source: {
      name: sourceMetadata.name || rawEvent.source?.name || 'Unknown',
      url: sourceMetadata.url || rawEvent.source?.url || '',
      type: sourceMetadata.type || rawEvent.source?.type || 'api',
    },
  };
}
