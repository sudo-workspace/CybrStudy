import { BaseSource } from './baseSource.js';
import { safeFetchJson } from '../fetcher/httpFetcher.js';

/**
 * CTFtime Source Connector
 * The premier global aggregator of cybersecurity hackathons, CTFs (Capture The Flag),
 * and red-teaming/infosec competitions.
 */
export class CTFtimeSource extends BaseSource {
  constructor() {
    super({
      name: 'CTFtime',
      type: 'api',
      url: 'https://ctftime.org/api/v1/events/?limit=50',
      enabled: true,
      intervalHours: 6,
    });
  }

  async fetchRaw() {
    return safeFetchJson(this.url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });
  }

  async extract(data) {
    const list = Array.isArray(data) ? data : [];
    return list.map((item) => {
      const isVirtual = !item.onsite;
      const locationText = item.location || '';
      const regUrl = item.url || item.ctftime_url || `https://ctftime.org/event/${item.id}`;

      // Check if location points to Maharashtra
      const lowerLoc = locationText.toLowerCase();
      const isMaharashtra =
        lowerLoc.includes('maharashtra') ||
        lowerLoc.includes('nagpur') ||
        lowerLoc.includes('mumbai') ||
        lowerLoc.includes('pune') ||
        regUrl.toLowerCase().includes('.in');

      return {
        title: item.title,
        description:
          item.description ||
          `Cybersecurity CTF Competition (${item.format || 'Jeopardy'} format). Test your offensive and defensive security skills.`,
        organizer: {
          name: (item.organizers && item.organizers[0]?.name) || 'Cyber Security Community',
          website: regUrl,
        },
        dates: {
          start: item.start || null,
          end: item.finish || null,
          registrationDeadline: item.start || null,
        },
        mode: isVirtual ? 'virtual' : (isMaharashtra ? 'physical' : 'virtual'),
        location: {
          city: isVirtual ? 'Virtual' : (locationText || 'Virtual'),
          state: isVirtual ? 'Online' : 'Maharashtra',
          country: isVirtual ? 'Worldwide' : 'India',
          venue: isVirtual ? 'Global Online Arena' : locationText,
        },
        eligibility: {
          countries: ['India', 'Worldwide'],
          studentOnly: false,
          ageRestriction: null,
          universityRestriction: null,
        },
        categories: [
          'Cybersecurity',
          'CTF',
          item.format || 'Jeopardy',
          'Information Security',
        ],
        technologies: [
          'Web Exploitation',
          'Reverse Engineering',
          'Cryptography',
          'Forensics',
          'Binary Exploitation (Pwn)',
        ],
        teamSize: {
          minimum: 1,
          maximum: 5,
        },
        prize: {
          amount: null,
          currency: 'USD',
          description: item.prizes || 'CTFtime Rating Points, Certificates & Bounties',
        },
        registrationUrl: regUrl,
        source: {
          name: 'CTFtime',
          url: item.ctftime_url || regUrl,
          type: 'api',
        },
      };
    });
  }
}
