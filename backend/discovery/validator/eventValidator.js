/**
 * Event Validator
 * Rejects invalid, expired, non-hackathon, or spam entries before writing to Firestore.
 */

const JUNK_KEYWORDS = [
  'blog post',
  'how to',
  'tutorial',
  'crash course',
  'bootcamp sale',
  'hire now',
  'advertisement',
  'sponsored post',
  'newspaper',
  'editorial',
];

export function validateEvent(event) {
  const errors = [];

  // 1. Minimum required fields
  if (!event || typeof event !== 'object') {
    return { valid: false, errors: ['Invalid event payload'] };
  }

  if (!event.title || event.title.length < 3) {
    errors.push('Missing or invalid event title');
  }

  const hasDate = Boolean(event.dates?.start || event.dates?.registrationDeadline);
  if (!hasDate) {
    errors.push('Missing event start date or registration deadline');
  }

  if (!event.registrationUrl || !isValidUrl(event.registrationUrl)) {
    errors.push(`Invalid registration URL: "${event.registrationUrl}"`);
  }

  // 2. Junk / Non-hackathon detection
  const lowerTitle = (event.title || '').toLowerCase();
  const lowerDesc = (event.description || '').toLowerCase();

  for (const junk of JUNK_KEYWORDS) {
    if (lowerTitle.includes(junk) || lowerDesc.includes(junk)) {
      errors.push(`Rejected non-hackathon content matching junk pattern: "${junk}"`);
      break;
    }
  }

  // 3. Expiration threshold check
  // Reject events that ended more than 14 days ago
  const endMs = event.dates?.end ? new Date(event.dates.end).getTime() : null;
  const deadlineMs = event.dates?.registrationDeadline ? new Date(event.dates.registrationDeadline).getTime() : null;
  const now = Date.now();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  if (endMs && now - endMs > fourteenDaysMs) {
    errors.push('Event ended more than 14 days ago (expired)');
  } else if (!endMs && deadlineMs && now - deadlineMs > fourteenDaysMs) {
    errors.push('Registration deadline ended more than 14 days ago (expired)');
  }

  // 4. Geographic & Mode Policy: Only Virtual hackathons and Maharashtra in-person hackathons are accepted
  if (!isAllowedLocationOrMode(event)) {
    errors.push(`Physical event outside Maharashtra rejected: "${event.location?.city || 'Unknown city'}, ${event.location?.state || 'Unknown state'}"`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export const MAHARASHTRA_IDENTIFIERS = [
  'maharashtra',
  'nagpur',
  'mumbai',
  'navi mumbai',
  'pune',
  'nashik',
  'aurangabad',
  'chhatrapati sambhajinagar',
  'sambhajinagar',
  'thane',
  'solapur',
  'kolhapur',
  'amravati',
  'nanded',
  'jalgaon',
  'akola',
  'latur',
  'dhule',
  'ahmednagar',
  'chandrapur',
  'ballarpur',
  'parbhani',
  'panvel',
  'kalyan',
  'dombivli',
  'vasai',
  'virar',
  'wardha',
  'digdoh',
  'hingna',
  'bhandara',
  'gondia',
  'gadchiroli',
  'yavatmal',
  'buldhana',
  'washim',
  'palghar',
  'raigad',
  'ratnagiri',
  'sindhudurg',
  'nandurbar',
  'sangli',
  'satara',
  'jalna',
  'beed',
  'osmanabad',
  'dharashiv',
  'hingoli',
  'powai',
  'vile parle',
  'andheri',
  'matunga',
  'kothrud',
  'pimpri',
  'chinchwad',
  'pcmc',
  'karad',
  'vidarbha',
  'marathwada',
  'vnit',
  'iiit nagpur',
  'rcoem',
  'rbu',
  'ghrce',
  'ycce',
  'priyadarshini',
  'pallotti',
  'gcoen',
  'kdk',
  'coep',
  'vjti',
  'spit',
  'pict',
];

export function isAllowedLocationOrMode(event) {
  if (!event) return false;
  // 1. Virtual hackathons are always allowed
  if (event.mode === 'virtual') return true;

  // 2. Physical or hybrid hackathons must be in Maharashtra
  const loc = event.location || {};
  const state = (loc.state || '').toLowerCase();
  if (state.includes('maharashtra') || state.includes('mh')) return true;

  const searchStr = `${loc.city || ''} ${loc.state || ''} ${loc.venue || ''} ${(event.categories || []).join(' ')} ${event.title || ''} ${event.organizer?.name || ''}`.toLowerCase();

  return MAHARASHTRA_IDENTIFIERS.some((keyword) => searchStr.includes(keyword));
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
