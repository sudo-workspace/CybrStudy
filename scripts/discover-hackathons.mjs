import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { executeDiscoveryPipeline } from '../backend/discovery/scheduler/runDiscovery.js';

// Read config from environment
const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

async function main() {
  console.log('[Discovery Runner] Initializing 24/7 Hackathon Discovery Sync...');
  
  let db = null;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (firebaseConfig.apiKey && firebaseConfig.projectId && adminEmail && adminPassword) {
    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      console.log(`[Discovery Runner] Authenticating as admin (${adminEmail})...`);
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('[Discovery Runner] Authenticated successfully with Firestore.');
      db = getFirestore(app);
    } catch (authErr) {
      console.warn('[Discovery Runner] Admin login failed. Operating in local JSON mode without Firestore sync:', authErr.message);
      db = null;
    }
  } else {
    console.log('[Discovery Runner] Running in local mode (no admin credentials provided)...');
  }

  const result = await executeDiscoveryPipeline({ db });
  console.log(`[Discovery Runner] Discovery complete. Total events processed: ${result.events.length}`);

  // Save discovered events locally as JSON fallback so the app always has live hackathons out of the box
  try {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const dataDir = path.resolve('src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const outputPath = path.join(dataDir, 'discoveredHackathons.json');
    fs.writeFileSync(outputPath, JSON.stringify(result.events, null, 2), 'utf8');
    console.log(`[Discovery Runner] Saved ${result.events.length} hackathons to ${outputPath}`);
  } catch (fsErr) {
    console.warn('[Discovery Runner] Could not write discoveredHackathons.json:', fsErr.message);
  }
}

main().catch((err) => {
  console.error('[Discovery Runner] Error:', err);
  process.exit(1);
});
