/**
 * Base Source Connector Interface
 */
export class BaseSource {
  constructor({ name, type, url, enabled = true, intervalHours = 6 }) {
    this.name = name;
    this.type = type; // 'api' | 'rss' | 'website' | 'curated'
    this.url = url;
    this.enabled = enabled;
    this.intervalHours = intervalHours;
  }

  /**
   * Fetch raw source payload
   * @returns {Promise<any>}
   */
  async fetchRaw() {
    throw new Error('fetchRaw() must be implemented by subclass');
  }

  /**
   * Extract intermediate event structures from raw payload
   * @param {any} raw
   * @returns {Promise<Array<object>>}
   */
  async extract(_raw) {
    throw new Error('extract() must be implemented by subclass');
  }

  /**
   * Execute full source pipeline: fetch + extract
   */
  async run() {
    if (!this.enabled) {
      return { source: this.name, events: [], skipped: true };
    }
    const raw = await this.fetchRaw();
    const events = await this.extract(raw);
    return {
      source: this.name,
      events: events || [],
      skipped: false,
    };
  }
}
