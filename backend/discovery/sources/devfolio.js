import { BaseSource } from './baseSource.js';
import { safeFetchJson } from '../fetcher/httpFetcher.js';

export class DevfolioSource extends BaseSource {
  constructor() {
    super({
      name: 'Devfolio',
      type: 'api',
      url: 'https://api.devfolio.co/api/hackathons?filter=all&page=1&limit=100',
      enabled: true,
      intervalHours: 4,
    });
  }

  async fetchRaw() {
    return safeFetchJson(this.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
  }

  async extract(data) {
    const list = data?.result || data?.data || [];
    return list.map((item) => {
      const setting = item.hackathon_setting || {};
      const slug = item.slug || setting.subdomain;
      const regUrl = slug ? `https://${slug}.devfolio.co` : (setting.site || item.url || '');

      const isOnline = item.is_online === true;
      const city = item.city || null;
      const state = item.state || null;
      const country = item.country || (city || state ? 'India' : null);

      const mode = isOnline ? 'virtual' : (city || state ? 'physical' : 'virtual');

      const categories = (item.themes || [])
        .map((t) => t.name)
        .filter(Boolean);

      const textMatch = `${item.name || ''} ${item.tagline || ''} ${item.desc || ''}`.toLowerCase();
      if (textMatch.includes('cyber') || textMatch.includes('ctf') || textMatch.includes('security')) {
        categories.push('Cybersecurity');
      }

      return {
        title: item.name || item.title,
        description: item.tagline || item.desc || `Devfolio Hackathon: ${item.name}`,
        organizer: {
          name: item.edition_name || slug || 'Devfolio Partner',
          website: setting.site || regUrl,
        },
        dates: {
          start: item.starts_at || null,
          end: item.ends_at || null,
          registrationDeadline: setting.reg_ends_at || null,
        },
        mode,
        location: {
          city,
          state,
          country,
          venue: item.location || (city && state ? `${city}, ${state}` : null),
        },
        eligibility: {
          countries: isOnline ? ['Worldwide'] : (country ? [country] : ['India']),
          studentOnly: true,
          ageRestriction: null,
          universityRestriction: null,
        },
        categories: categories.length > 0 ? categories : ['Open Innovation'],
        technologies: [],
        teamSize: {
          minimum: 1,
          maximum: 4,
        },
        prize: {
          amount: null,
          currency: 'INR',
          description: null,
        },
        registrationUrl: regUrl,
        source: {
          name: 'Devfolio',
          url: regUrl,
          type: 'api',
        },
      };
    });
  }
}
