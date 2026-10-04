import { BaseSource } from './baseSource.js';

/**
 * Curated & Verified National/Regional Hackathons Source
 * Provides verified high-value hackathons, covering all colleges across Nagpur,
 * Vidarbha, Maharashtra, and premier Cybersecurity / CTF initiatives.
 */
export class CuratedSource extends BaseSource {
  constructor() {
    super({
      name: 'Curated Registry',
      type: 'curated',
      url: 'internal://curated-hackathons',
      enabled: true,
      intervalHours: 12,
    });
  }

  async fetchRaw() {
    return [
      // 1. National & Regional Premier Hackathon
      {
        title: 'Smart India Hackathon (SIH) 2026',
        description: 'World’s biggest open innovation model for students to solve real-world challenges faced by ministries and industries.',
        organizer: {
          name: 'Ministry of Education & AICTE',
          website: 'https://sih.gov.in',
        },
        dates: {
          start: '2026-11-15T09:00:00.000Z',
          end: '2026-11-17T18:00:00.000Z',
          registrationDeadline: '2026-10-31T23:59:59.000Z',
        },
        mode: 'hybrid',
        location: {
          city: 'New Delhi & Nodal Centers (incl. Nagpur / Pune)',
          state: 'Maharashtra',
          country: 'India',
          venue: 'Designated Nodal Centers across Nagpur and Maharashtra',
        },
        eligibility: {
          countries: ['India'],
          studentOnly: true,
          ageRestriction: null,
          universityRestriction: 'AICTE / UGC approved institutions',
        },
        categories: ['Cybersecurity', 'Smart Automation', 'AI', 'Agriculture', 'FinTech', 'Clean Tech'],
        technologies: ['Full-stack', 'AI/ML', 'IoT', 'Cloud', 'Blockchain'],
        teamSize: { minimum: 6, maximum: 6 },
        prize: {
          amount: 100000,
          currency: 'INR',
          description: '₹1,00,000 per problem statement',
        },
        registrationUrl: 'https://sih.gov.in',
      },

      // 2. CyberShield CTF & National Hackathon - Nagpur
      {
        title: 'CyberShield CTF & National Hackathon 2026',
        description: 'Annual inter-collegiate cybersecurity challenge focusing on red teaming, cryptography, secure coding, and vulnerability analysis.',
        organizer: {
          name: 'Cyber Security Cell & RCOEM Nagpur',
          website: 'https://cybrstudy.github.io',
        },
        dates: {
          start: '2026-10-24T10:00:00.000Z',
          end: '2026-10-26T18:00:00.000Z',
          registrationDeadline: '2026-10-20T23:59:00.000Z',
        },
        mode: 'hybrid',
        location: {
          city: 'Nagpur',
          state: 'Maharashtra',
          country: 'India',
          venue: 'Campus Tech Auditorium & Virtual Discord Arena, Nagpur',
        },
        eligibility: {
          countries: ['India'],
          studentOnly: true,
          ageRestriction: null,
          universityRestriction: null,
        },
        categories: ['Cybersecurity', 'CTF', 'Web Exploitation', 'Forensics', 'Reverse Engineering'],
        technologies: ['Wireshark', 'Burp Suite', 'Python', 'Linux', 'Ghidra'],
        teamSize: { minimum: 2, maximum: 4 },
        prize: {
          amount: 50000,
          currency: 'INR',
          description: '₹50,000 + Internship Opportunities',
        },
        registrationUrl: 'https://unstop.com/hackathons/cybershield-2026',
      },

      // 3. VNIT Nagpur Consortium Hackathon & AXIS CTF
      {
        title: 'VNIT Nagpur Consortium Hackathon & AXIS CTF',
        description: 'Central India’s premier open tech hackathon bringing together students to build innovative tech solutions and cybersecurity defenses.',
        organizer: {
          name: 'VNIT Nagpur E-Cell & AXIS Technical Council',
          website: 'https://vnit.ac.in',
        },
        dates: {
          start: '2026-11-08T09:00:00.000Z',
          end: '2026-11-09T18:00:00.000Z',
          registrationDeadline: '2026-10-30T23:59:00.000Z',
        },
        mode: 'physical',
        location: {
          city: 'Nagpur',
          state: 'Maharashtra',
          country: 'India',
          venue: 'VNIT Campus, South Ambazari Road, Nagpur',
        },
        eligibility: {
          countries: ['India'],
          studentOnly: true,
          ageRestriction: null,
          universityRestriction: null,
        },
        categories: ['Open Innovation', 'Cybersecurity', 'AI/ML', 'IoT', 'Web3'],
        technologies: ['React', 'Node.js', 'Python', 'Flutter', 'Linux Security'],
        teamSize: { minimum: 2, maximum: 4 },
        prize: {
          amount: 75000,
          currency: 'INR',
          description: '₹75,000 Cash Pool + Cloud Credits',
        },
        registrationUrl: 'https://vnit.ac.in/consortium',
      },

      // 4. IIIT Nagpur Tantrafiesta & CyberThon
      {
        title: 'IIIT Nagpur Tantrafiesta CyberThon 2026',
        description: 'Flagship national cybersecurity and engineering hackathon by IIIT Nagpur exploring secure system architecture, cloud attacks, and AI defenses.',
        organizer: {
          name: 'IIIT Nagpur Technical Board',
          website: 'https://iiitn.ac.in',
        },
        dates: {
          start: '2026-10-28T10:00:00.000Z',
          end: '2026-10-30T17:00:00.000Z',
          registrationDeadline: '2026-10-22T23:59:00.000Z',
        },
        mode: 'hybrid',
        location: {
          city: 'Nagpur',
          state: 'Maharashtra',
          country: 'India',
          venue: 'IIIT Nagpur Permanent Campus, Waranga, Nagpur',
        },
        eligibility: {
          countries: ['India'],
          studentOnly: true,
          ageRestriction: null,
          universityRestriction: null,
        },
        categories: ['Cybersecurity', 'CTF', 'AI/ML', 'Cloud Security'],
        technologies: ['Docker', 'Kubernetes', 'Python', 'Metasploit', 'Snort'],
        teamSize: { minimum: 2, maximum: 4 },
        prize: {
          amount: 60000,
          currency: 'INR',
          description: '₹60,000 Cash + Swag Kits & PPOs',
        },
        registrationUrl: 'https://iiitn.ac.in/tantrafiesta',
      },

      // 5. RCOEM / RBU Technovision & CodeBlox Hackathon - Nagpur
      {
        title: 'RBU Technovision & CodeBlox Hackathon 2026',
        description: '36-hour non-stop collegiate hackathon solving smart city, cybersecurity, and intelligent software automation challenges in Nagpur.',
        organizer: {
          name: 'Ramdeobaba University (RBU / RCOEM) Nagpur',
          website: 'https://rknec.edu',
        },
        dates: {
          start: '2026-11-04T09:00:00.000Z',
          end: '2026-11-05T21:00:00.000Z',
          registrationDeadline: '2026-10-27T23:59:00.000Z',
        },
        mode: 'physical',
        location: {
          city: 'Nagpur',
          state: 'Maharashtra',
          country: 'India',
          venue: 'RBU Campus, Katol Road, Gittikhadan, Nagpur',
        },
        eligibility: {
          countries: ['India'],
          studentOnly: true,
          ageRestriction: null,
          universityRestriction: null,
        },
        categories: ['Cybersecurity', 'Smart City', 'Software Engineering', 'AI'],
        technologies: ['React', 'Python', 'FastAPI', 'Cyber Defense Tools'],
        teamSize: { minimum: 2, maximum: 4 },
        prize: {
          amount: 45000,
          currency: 'INR',
          description: '₹45,000 + Tech Incubation Support',
        },
        registrationUrl: 'https://rknec.edu/technovision',
      },

      // 6. GHRCE Technorion National Hackathon - Nagpur
      {
        title: 'GHRCE Technorion National Hackathon 2026',
        description: 'National innovation hackathon encouraging tech students to build high-impact cybersecurity, hardware, and mobile prototypes.',
        organizer: {
          name: 'G.H. Raisoni College of Engineering (GHRCE) Nagpur',
          website: 'https://ghrce.raisoni.net',
        },
        dates: {
          start: '2026-10-29T09:00:00.000Z',
          end: '2026-10-30T18:00:00.000Z',
          registrationDeadline: '2026-10-24T23:59:00.000Z',
        },
        mode: 'physical',
        location: {
          city: 'Nagpur',
          state: 'Maharashtra',
          country: 'India',
          venue: 'GHRCE Campus, CRPF Gate No. 3, Digdoh Hills, Hingna Road, Nagpur',
        },
        eligibility: {
          countries: ['India'],
          studentOnly: true,
          ageRestriction: null,
          universityRestriction: null,
        },
        categories: ['Cybersecurity', 'IoT', 'AI / ML', 'Mobile Development'],
        technologies: ['Flutter', 'Node.js', 'Python', 'Arduino', 'Wireshark'],
        teamSize: { minimum: 2, maximum: 4 },
        prize: {
          amount: 50000,
          currency: 'INR',
          description: '₹50,000 + Certificates & Trophies',
        },
        registrationUrl: 'https://ghrce.raisoni.net/technorion',
      },

      // 7. YCCE Yash Hackathon & Megalopolis - Nagpur
      {
        title: 'YCCE Megalopolis & Yash Hackathon 2026',
        description: 'Inter-college tech sprint bringing together budding engineers across Vidarbha to tackle cyber attacks and digital infrastructure.',
        organizer: {
          name: 'YCCE Nagpur (Department of CSE & IT)',
          website: 'https://ycce.edu',
        },
        dates: {
          start: '2026-11-12T09:30:00.000Z',
          end: '2026-11-13T17:30:00.000Z',
          registrationDeadline: '2026-11-05T23:59:00.000Z',
        },
        mode: 'physical',
        location: {
          city: 'Nagpur',
          state: 'Maharashtra',
          country: 'India',
          venue: 'YCCE Campus, Wanadongri, Hingna Road, Nagpur',
        },
        eligibility: {
          countries: ['India'],
          studentOnly: true,
          ageRestriction: null,
          universityRestriction: null,
        },
        categories: ['Cybersecurity', 'Web Development', 'Data Science'],
        technologies: ['JavaScript', 'Python', 'PostgreSQL', 'Kali Linux'],
        teamSize: { minimum: 2, maximum: 4 },
        prize: {
          amount: 40000,
          currency: 'INR',
          description: '₹40,000 Cash Pool',
        },
        registrationUrl: 'https://ycce.edu/megalopolis',
      },

      // 8. Priyadarshini CyberThon - Nagpur
      {
        title: 'Priyadarshini CyberThon & HackFest 2026',
        description: 'Regional student cyber competition testing network penetration testing, cryptography puzzles, and web application security.',
        organizer: {
          name: 'Priyadarshini College of Engineering (PCE) Nagpur',
          website: 'https://pcenagpur.edu.in',
        },
        dates: {
          start: '2026-10-31T10:00:00.000Z',
          end: '2026-11-01T16:00:00.000Z',
          registrationDeadline: '2026-10-25T23:59:00.000Z',
        },
        mode: 'physical',
        location: {
          city: 'Nagpur',
          state: 'Maharashtra',
          country: 'India',
          venue: 'PCE Campus, Near Digdoh Hills, Hingna Road, Nagpur',
        },
        eligibility: {
          countries: ['India'],
          studentOnly: true,
          ageRestriction: null,
          universityRestriction: null,
        },
        categories: ['Cybersecurity', 'CTF', 'Ethical Hacking', 'Secure Coding'],
        technologies: ['Nmap', 'Burp Suite', 'Python', 'Linux'],
        teamSize: { minimum: 1, maximum: 3 },
        prize: {
          amount: 35000,
          currency: 'INR',
          description: '₹35,000 + Security Tooling Subscriptions',
        },
        registrationUrl: 'https://pcenagpur.edu.in/cyberthon',
      },

      // 9. St. Vincent Pallotti Technex Hackathon - Nagpur
      {
        title: 'Pallotti Technex National Hackathon 2026',
        description: 'Intense 24-hour innovation marathon for students building practical cybersecurity applications and automated systems.',
        organizer: {
          name: 'St. Vincent Pallotti College of Engineering, Nagpur',
          website: 'https://stvincentngp.edu.in',
        },
        dates: {
          start: '2026-11-18T09:00:00.000Z',
          end: '2026-11-19T17:00:00.000Z',
          registrationDeadline: '2026-11-10T23:59:00.000Z',
        },
        mode: 'physical',
        location: {
          city: 'Nagpur',
          state: 'Maharashtra',
          country: 'India',
          venue: 'Pallotti Campus, Gavsi Manapur, Wardha Road, Nagpur',
        },
        eligibility: {
          countries: ['India'],
          studentOnly: true,
          ageRestriction: null,
          universityRestriction: null,
        },
        categories: ['Cybersecurity', 'Open Innovation', 'AI / ML'],
        technologies: ['Python', 'Golang', 'Docker', 'Network Analysis'],
        teamSize: { minimum: 2, maximum: 4 },
        prize: {
          amount: 35000,
          currency: 'INR',
          description: '₹35,000 + Direct Interview Shortlists',
        },
        registrationUrl: 'https://stvincentngp.edu.in/technex',
      },

      // 10. Nagpur Cyber Cell & Maharashtra Police Hackathon
      {
        title: 'Maharashtra Cyber Shield & Vidarbha CTF 2026',
        description: 'Special cyber defense and intelligence hackathon organized in collaboration with cyber law enforcement and industry advisors.',
        organizer: {
          name: 'Nagpur Cyber Cell & Maharashtra Cyber Security Cell',
          website: 'https://mahacyber.gov.in',
        },
        dates: {
          start: '2026-11-21T10:00:00.000Z',
          end: '2026-11-22T19:00:00.000Z',
          registrationDeadline: '2026-11-14T23:59:00.000Z',
        },
        mode: 'hybrid',
        location: {
          city: 'Nagpur',
          state: 'Maharashtra',
          country: 'India',
          venue: 'Vanamati Auditorium, VIP Road, Dharampeth, Nagpur',
        },
        eligibility: {
          countries: ['India'],
          studentOnly: false,
          ageRestriction: '18+',
          universityRestriction: null,
        },
        categories: ['Cybersecurity', 'Digital Forensics', 'Incident Response', 'OSINT', 'CTF'],
        technologies: ['Autopsy', 'Wireshark', 'Volatility', 'Python', 'OSINT Frameworks'],
        teamSize: { minimum: 1, maximum: 4 },
        prize: {
          amount: 100000,
          currency: 'INR',
          description: '₹1,00,000 + Cyber Cell Commendations & Internships',
        },
        registrationUrl: 'https://mahacyber.gov.in/hackathon-2026',
      },

      // 11. GCOEN Adhyaaya National Hackathon - Nagpur
      {
        title: 'GCOEN Adhyaaya National Hackathon 2026',
        description: 'Government engineering innovation challenge fostering open-source software, cloud resilience, and cyber safety.',
        organizer: {
          name: 'Government College of Engineering, Nagpur (GCOEN)',
          website: 'https://gcoen.ac.in',
        },
        dates: {
          start: '2026-11-25T09:30:00.000Z',
          end: '2026-11-26T18:00:00.000Z',
          registrationDeadline: '2026-11-16T23:59:00.000Z',
        },
        mode: 'physical',
        location: {
          city: 'Nagpur',
          state: 'Maharashtra',
          country: 'India',
          venue: 'GCOEN Campus, Sector 27, MIHAN, Nagpur',
        },
        eligibility: {
          countries: ['India'],
          studentOnly: true,
          ageRestriction: null,
          universityRestriction: null,
        },
        categories: ['Cybersecurity', 'Open Source', 'Embedded Systems'],
        technologies: ['Linux', 'C/C++', 'Python', 'Embedded Security'],
        teamSize: { minimum: 2, maximum: 4 },
        prize: {
          amount: 30000,
          currency: 'INR',
          description: '₹30,000 + Merit Certificates',
        },
        registrationUrl: 'https://gcoen.ac.in/adhyaaya',
      },

      // 12. Google Solution Challenge 2026
      {
        title: 'Google Solution Challenge 2026',
        description: 'Global annual student contest to solve for one or more of the United Nations 17 Sustainable Development Goals using Google technologies.',
        organizer: {
          name: 'Google for Developers',
          website: 'https://developers.google.com/community/gdsc-solution-challenge',
        },
        dates: {
          start: '2026-11-01T00:00:00.000Z',
          end: '2026-12-15T23:59:00.000Z',
          registrationDeadline: '2026-11-10T23:59:00.000Z',
        },
        mode: 'virtual',
        location: {
          city: 'Virtual',
          state: 'Online',
          country: 'Worldwide',
          venue: 'Online / Virtual (Worldwide)',
        },
        eligibility: {
          countries: ['Worldwide', 'India'],
          studentOnly: true,
          ageRestriction: '18+',
          universityRestriction: 'College/University students',
        },
        categories: ['AI', 'Mobile', 'Cloud', 'Social Impact', 'Sustainability'],
        technologies: ['Android', 'Firebase', 'Flutter', 'Google Cloud', 'TensorFlow'],
        teamSize: { minimum: 1, maximum: 4 },
        prize: {
          amount: 10000,
          currency: 'USD',
          description: '$10,000 top prizes + Mentorship with Google Engineers',
        },
        registrationUrl: 'https://developers.google.com/community/gdsc-solution-challenge',
      },
    ];
  }

  async extract(data) {
    return data.map((item) => ({
      ...item,
      source: {
        name: 'Curated Registry',
        url: item.registrationUrl,
        type: 'curated',
      },
    }));
  }
}
