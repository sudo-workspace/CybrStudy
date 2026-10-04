import { DISCOVERY_CONFIG } from '../config/discoveryConfig.js';

/**
 * Robust, lightweight HTTP fetcher for hackathon sources.
 * - Enforces timeouts
 * - Retries on transient network errors
 * - Logs failures without crashing the pipeline
 */
export async function safeFetch(url, options = {}) {
  const timeoutMs = options.timeoutMs || DISCOVERY_CONFIG.requestTimeoutMs;
  const retries = options.retries ?? DISCOVERY_CONFIG.maxRetries;
  const headers = {
    'User-Agent': DISCOVERY_CONFIG.userAgent,
    'Accept': 'application/json, application/xml, text/xml, text/html;q=0.9, */*;q=0.8',
    ...(options.headers || {}),
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: options.method || 'GET',
        headers,
        signal: controller.signal,
        body: options.body,
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return res;
    } catch (err) {
      clearTimeout(timer);
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) {
        throw new Error(`Failed to fetch ${url} after ${retries + 1} attempts: ${err.message}`);
      }
      // Exponential backoff
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
}

/**
 * Fetch and parse JSON safely
 */
export async function safeFetchJson(url, options = {}) {
  const res = await safeFetch(url, options);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Malformed JSON response from ${url}: ${err.message}`);
  }
}
