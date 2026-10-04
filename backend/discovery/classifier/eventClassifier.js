/**
 * Event Classifier (Rule-Based with Optional AI Hook)
 * Categorizes and classifies events using fast deterministic rules.
 */

export function classifyEvent(event) {
  const text = `${event.title} ${event.description} ${event.location?.venue || ''}`.toLowerCase();

  // Mode classification refine
  let mode = event.mode;
  if (!mode || mode === 'unknown') {
    if (text.includes('online') || text.includes('virtual') || text.includes('discord') || text.includes('remote')) {
      mode = 'virtual';
    } else if (text.includes('campus') || text.includes('hall') || text.includes('auditorium') || text.includes('in-person')) {
      mode = 'physical';
    } else {
      mode = 'virtual';
    }
  }

  // Location tags
  const tags = new Set(event.categories || []);
  if (text.includes('nagpur')) {
    tags.add('Nagpur');
  }
  if (text.includes('maharashtra') || text.includes('pune') || text.includes('mumbai')) {
    tags.add('Maharashtra');
  }
  if (text.includes('ctf') || text.includes('cyber') || text.includes('security')) {
    tags.add('Cybersecurity');
  }
  if (text.includes('ai') || text.includes('gpt') || text.includes('llm') || text.includes('machine learning')) {
    tags.add('AI / ML');
  }

  return {
    ...event,
    mode,
    categories: Array.from(tags),
  };
}
