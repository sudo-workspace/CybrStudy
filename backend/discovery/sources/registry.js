import { DevfolioSource } from './devfolio.js';
import { UnstopSource } from './unstop.js';
import { CuratedSource } from './curated.js';
import { CTFtimeSource } from './ctftime.js';

/**
 * Source Registry: Manages and instantiates active hackathon connectors.
 * Easy to register new sources (e.g. MLH, Devpost, Eventbrite, RSS feeds).
 */
export class SourceRegistry {
  constructor() {
    this.sources = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    this.register(new DevfolioSource());
    this.register(new UnstopSource());
    this.register(new CTFtimeSource());
    this.register(new CuratedSource());
  }

  /**
   * Register a new source connector
   */
  register(sourceInstance) {
    this.sources.set(sourceInstance.name, sourceInstance);
  }

  /**
   * Unregister or disable a source
   */
  unregister(sourceName) {
    this.sources.delete(sourceName);
  }

  /**
   * Get all registered sources
   */
  getAll() {
    return Array.from(this.sources.values());
  }

  /**
   * Get all enabled sources
   */
  getEnabled() {
    return this.getAll().filter((s) => s.enabled);
  }

  /**
   * Enable or disable a source
   */
  setEnabled(sourceName, isEnabled) {
    const src = this.sources.get(sourceName);
    if (src) {
      src.enabled = isEnabled;
    }
  }
}
