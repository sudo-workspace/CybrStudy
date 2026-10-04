import { BaseSource } from './baseSource.js';
import { safeFetchJson } from '../fetcher/httpFetcher.js';

export class UnstopSource extends BaseSource {
  constructor() {
    super({
      name: 'Unstop',
      type: 'api',
      url: 'https://unstop.com/api/public/opportunity/search-result',
      enabled: true,
      intervalHours: 4,
    });
  }

  async fetchRaw() {
    // Multi-query search covering live open hackathons, competitions, coding contests, and regional searches
    const endpoints = [
      'https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&oppstatus=open&per_page=50&page=1',
      'https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&oppstatus=open&per_page=50&page=2',
      'https://unstop.com/api/public/opportunity/search-result?opportunity=competitions&oppstatus=open&per_page=50&page=1',
      'https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&search=nagpur',
      'https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&search=maharashtra',
      'https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&search=cyber',
    ];

    const results = await Promise.allSettled(
      endpoints.map((url) =>
        safeFetchJson(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
        })
      )
    );

    const mergedMap = new Map();

    for (const res of results) {
      if (res.status === 'fulfilled' && res.value) {
        const list = res.value?.data?.data || res.value?.data || [];
        for (const item of list) {
          if (item && item.id && !mergedMap.has(item.id)) {
            mergedMap.set(item.id, item);
          }
        }
      }
    }

    return Array.from(mergedMap.values());
  }

  async extract(data) {
    const list = Array.isArray(data) ? data : data?.data?.data || data?.data || [];
    return list.map((item) => {
      const addr = item.address_with_country_logo || {};
      const regn = item.regnRequirements || {};
      const org = item.organisation || {};

      const city = addr.city || null;
      const state = addr.state || null;
      const country = addr.country?.name || (city || state ? 'India' : null);

      // Check mode
      const isOnline = item.region === 'online' || item.work_location_type === 'online' || !city;
      const mode = isOnline ? 'virtual' : 'physical';

      // Skills and categories
      const skills = (item.required_skills || []).map((s) => s.skill || s.skill_name).filter(Boolean);
      const filterCategories = (item.filters || [])
        .filter((f) => f.type === 'category')
        .map((f) => f.name);

      const combinedCategories = new Set([...filterCategories, ...skills.slice(0, 3)]);

      // Auto-tag Cybersecurity & CTFs
      const textMatch = `${item.title || ''} ${item.sub_title || ''} ${item.excerpt || ''}`.toLowerCase();
      if (
        textMatch.includes('cyber') ||
        textMatch.includes('ctf') ||
        textMatch.includes('security') ||
        textMatch.includes('flag') ||
        textMatch.includes('forensic')
      ) {
        combinedCategories.add('Cybersecurity');
        combinedCategories.add('CTF');
      }

      if (textMatch.includes('ai') || textMatch.includes('machine learning') || textMatch.includes('llm')) {
        combinedCategories.add('AI / ML');
      }

      const categories = Array.from(combinedCategories);
      if (categories.length === 0) categories.push('Hackathon');

      // Prize
      let prizeAmount = null;
      let prizeCurrency = 'INR';
      let prizeDesc = null;

      if (Array.isArray(item.prizes) && item.prizes.length > 0) {
        const totalCash = item.prizes.reduce((sum, p) => sum + (Number(p.cash) || 0), 0);
        if (totalCash > 0) {
          prizeAmount = totalCash;
          prizeCurrency = item.prizes[0]?.currencyCode || 'INR';
          prizeDesc = `${prizeCurrency === 'INR' ? '₹' : prizeCurrency + ' '}${totalCash.toLocaleString()}`;
        }
      }

      // Registration URL
      const regUrl = item.seo_url
        ? `https://unstop.com/${item.seo_url}`
        : item.short_url || item.public_url || `https://unstop.com/hackathons/${item.id}`;

      return {
        title: item.title,
        description: item.sub_title || item.excerpt || `${org.name || 'Unstop'} Opportunity`,
        organizer: {
          name: org.name || 'Academic Institution',
          website: org.url || regUrl,
        },
        dates: {
          start: item.start_date || null,
          end: item.end_date || null,
          registrationDeadline: regn.end_regn_dt || null,
        },
        mode,
        location: {
          city,
          state,
          country,
          venue: addr.address || (city && state ? `${city}, ${state}` : null),
        },
        eligibility: {
          countries: isOnline ? ['India', 'Worldwide'] : country ? [country] : ['India'],
          studentOnly: true,
          ageRestriction: null,
          universityRestriction: org.name || null,
        },
        categories,
        technologies: skills,
        teamSize: {
          minimum: regn.min_team_size || 1,
          maximum: regn.max_team_size || 4,
        },
        prize: {
          amount: prizeAmount,
          currency: prizeCurrency,
          description: prizeDesc,
        },
        registrationUrl: regUrl,
        source: {
          name: 'Unstop',
          url: regUrl,
          type: 'api',
        },
      };
    });
  }
}
