# CybrStudy

> A beautifully designed, human-centric Study Material Platform hosted on GitHub Pages.

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend Framework | React 19 + Vite | Fast builds, SPA routing, GitHub Pages compatible |
| Styling | Vanilla CSS (custom design system) | Full control, zero runtime cost |
| Database / BaaS | Firebase Firestore | Real-time, SDK works from static sites |
| Authentication | Firebase Auth (Email/Password) | Secure, no server needed |
| File Storage | Google Drive (via Apps Script proxy) | Free, private, hides admin identity |
| PDF Preview | pdfjs-dist | In-browser, no download required |
| Routing | React Router v6 | Hash routing for GitHub Pages |

---

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/CybrStudy.git
cd CybrStudy
npm install
```

### 2. Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (disable Google Analytics for simplicity)
3. Go to **Build → Firestore Database** → Create database (start in **production mode**)
4. Go to **Build → Authentication** → Sign-in method → Enable **Email/Password**
5. Create an admin user via the Firebase console (Authentication → Add user)
6. Go to **Project Settings** → copy your Web App config keys

### 3. Configure Firestore Security Rules

Go to **Firestore → Rules** and paste the following. These rules cover all collections used by CybrStudy:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Verify user is signed in with a valid token and email
    function isSignedIn() {
      return request.auth != null && request.auth.token.email != null;
    }

    // Helper: Check if signed-in user's email exists in the admins collection
    function isAdmin() {
      return isSignedIn() && (
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email.lower())) ||
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email))
      );
    }

    // Helper: Check if account is marked disabled in users collection
    function isAccountDisabled() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.disabled == true;
    }

    // Sections — active authenticated users can read; only verified admins can write
    match /sections/{document=**} {
      allow read:  if isSignedIn() && !isAccountDisabled();
      allow write: if isAdmin() && !isAccountDisabled();
    }

    // Files — active authenticated users can read; only verified admins can write
    match /files/{document=**} {
      allow read:  if isSignedIn() && !isAccountDisabled();
      allow write: if isAdmin() && !isAccountDisabled();
    }

    // Notifications — active authenticated users can read; only verified admins can write
    match /notifications/{document=**} {
      allow read:  if isSignedIn() && !isAccountDisabled();
      allow write: if isAdmin() && !isAccountDisabled();
    }

    // Hackathons — active authenticated users can read; only verified admins can modify
    match /hackathons/{document=**} {
      allow read:  if isSignedIn() && !isAccountDisabled();
      allow write: if isAdmin() && !isAccountDisabled();
    }

    // Source Runs (Discovery Logs) — active authenticated users can read; only admins can write
    match /sourceRuns/{document=**} {
      allow read:  if isSignedIn() && !isAccountDisabled();
      allow write: if isAdmin() && !isAccountDisabled();
    }

    // Sources registry configuration — active authenticated users can read; only admins can write
    match /sources/{document=**} {
      allow read:  if isSignedIn() && !isAccountDisabled();
      allow write: if isAdmin() && !isAccountDisabled();
    }

    // Users — users can only manage their own doc; cannot escalate isAdmin or disabled
    match /users/{uid} {
      allow read: if isSignedIn() && (request.auth.uid == uid || isAdmin());

      allow create: if isSignedIn() && (
        (request.auth.uid == uid && (!request.resource.data.keys().hasAny(['isAdmin', 'disabled']) || request.resource.data.isAdmin == false)) ||
        isAdmin()
      );

      allow update: if isSignedIn() && (
        (request.auth.uid == uid && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['isAdmin', 'disabled'])) ||
        isAdmin()
      );

      allow delete: if isAdmin();
    }

    // Admins — only verified admins can read or write
    match /admins/{email} {
      allow read, write: if isAdmin();
    }
  }
}
```

### 4. Set Up Google Drive Proxy (Apps Script)

1. Go to [script.google.com](https://script.google.com) → New Project
2. Paste the contents of `src/services/AppScript_DriveProxy.js`
3. Click **Deploy → New Deployment → Web App**
   - Execute as: **Me** (your Google account)
   - Who has access: **Anyone**
4. Copy the deployment URL and add it to your `.env` file

### 5. Configure Environment Variables

```bash
cp .env.example .env
# Fill in your values in .env
```

### 6. Configure GitHub Secrets (for CI/CD Deploy)

In your GitHub repository → **Settings → Secrets and variables → Actions**, add:

| Secret Name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | e.g. `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | e.g. `project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
| `VITE_FIREBASE_APP_ID` | Your app ID |
| `VITE_GDRIVE_PROXY_URL` | Your Apps Script Web App URL |

### 7. Deploy to GitHub Pages

The `.github/workflows/deploy.yml` will auto-deploy on every push to `main`.

Enable GitHub Pages: **Settings → Pages → Source: GitHub Actions**

---

## Admin Access

The admin portal can be accessed directly at:

`https://YOUR_USERNAME.github.io/CybrStudy/#/login`

*(You can configure a custom admin route via `VITE_ADMIN_ROUTE` in `.env`)*

---

## Folder Structure

```
CybrStudy/
├── .github/
│   └── workflows/
│       └── deploy.yml           # Auto-deploy to GitHub Pages
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── Toast.jsx
│   │   ├── sections/
│   │   │   ├── SectionTree.jsx  # Recursive section renderer
│   │   │   └── SectionNode.jsx  # Single node with expand/collapse
│   │   ├── files/
│   │   │   ├── FileGrid.jsx
│   │   │   ├── FileCard.jsx
│   │   │   └── MediaPreview.jsx # PDF.js + image previewer
│   │   └── admin/
│   │       ├── SectionManager.jsx
│   │       ├── FileUploader.jsx
│   │       └── AdminDashboard.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── BrowsePage.jsx
│   │   ├── AdminLoginPage.jsx
│   │   └── AdminPage.jsx
│   ├── services/
│   │   ├── firebase.js          # Firebase init + Firestore helpers
│   │   ├── driveService.js      # Google Drive proxy calls
│   │   └── authService.js       # Firebase Auth helpers
│   │   AppScript_DriveProxy.js  # Paste into Google Apps Script
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   ├── hooks/
│   │   ├── useSections.js
│   │   └── useFiles.js
│   ├── styles/
│   │   ├── index.css            # Design system tokens + global styles
│   │   ├── components.css       # Shared component styles
│   │   └── admin.css            # Admin-specific styles
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── 404.html                 # SPA fallback for GitHub Pages
├── .env.example
├── .gitignore
├── index.html
├── vite.config.js
└── README.md
```

---

## 24/7 Autonomous Hackathon Discovery Engine

CybrStudy includes a lightweight, automated background hackathon discovery system that continuously aggregates, validates, normalizes, and deduplicates student hackathons across India and worldwide.

### Pipeline Architecture

```text
       EXTERNAL SOURCES (APIs & Public Feeds)
      [ Devfolio API | Unstop API | Curated Registry ]
                           │
                           ▼
                   SOURCE CONNECTORS
                           │
                           ▼
                    DATA EXTRACTION
                           │
                           ▼
                    NORMALIZATION
        (Standard modes: virtual, physical, hybrid,
         ISO dates, cities/states, currency)
                           │
                           ▼
                     VALIDATION
          (Required fields, non-junk check,
           expiry threshold detection)
                           │
                           ▼
                    DEDUPLICATION
         (Deterministic cryptographic fingerprint)
                           │
                           ▼
                 FIRESTORE DATABASE
             (/hackathons & /sourceRuns)
                           │
                           ▼
              CYBRSTUDY WEB INTERFACE
      - Homepage spotlight with live 24/7 engine badge
      - Full interactive /#/hackathons portal
      - Admin management & on-demand sync dashboard
```

### Automation & Scheduled Execution

- **GitHub Actions Scheduled Cron** (`.github/workflows/hackathon-discovery.yml`): Runs automatically every 6 hours (`0 */6 * * *`) and on `workflow_dispatch`.
- **Zero Frontend Scraping**: The web application only reads clean, structured data from Firestore.
- **Local / CLI Execution**:
  ```bash
  npm run discover          # Runs discovery and prints formatted audit report
  npm run discover:sync     # Runs discovery and syncs directly to Firestore
  ```

---

System Architecture -

<img width="14323" height="7940" alt="diagram(5)" src="https://github.com/user-attachments/assets/78868a07-3120-4b73-860f-3644b2c213b9" />

---


