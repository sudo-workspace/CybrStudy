/**
 * 24/7 Hackathon Discovery Engine Configuration
 */
export const DISCOVERY_CONFIG = {
  version: '1.0.0',
  defaultIntervalHours: 6,
  requestTimeoutMs: 15000,
  maxRetries: 2,
  userAgent: 'CybrStudy-HackathonDiscovery/1.0 (+https://github.com/Sudo-Anu/CybrStudy)',
  
  // Locations of special interest to highlight or classify
  priorityLocations: [
    'Nagpur',
    'Maharashtra',
    'Pune',
    'Mumbai',
    'Bengaluru',
    'Bangalore',
    'Delhi',
    'Hyderabad',
    'India',
    'Worldwide',
  ],

  // Common high-demand tech / theme categories
  categories: [
    'Cybersecurity',
    'Artificial Intelligence',
    'Machine Learning',
    'Web3 / Blockchain',
    'Web Development',
    'Cloud & DevOps',
    'Open Source',
    'Mobile & IoT',
    'FinTech',
    'HealthTech',
    'EdTech',
    'Social Good',
    'Open Innovation',
  ],

  // Expiration thresholds (in days)
  archiveAfterDays: 14, // Keep completed events visible for 14 days before archiving
};
