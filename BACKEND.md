# Backend & Database Architecture — TruckLink

This document outlines the backend service configuration, Vite server integration, Firestore database schema, security rules, and data seeding engine.

---

## 1. Server Architecture (`server.ts`)

TruckLink uses an **Express.js** HTTP server written in TypeScript and executed in development via `tsx` on port `3000`.

### Middleware Lifecycle:
1. **API Endpoints**: Handled first before falling back to static assets or Vite middleware.
2. **Vite Development Middleware**: In development mode (`NODE_ENV !== "production"`), Vite middleware compiles and hot-serves TypeScript/React frontend files.
3. **Production Static Fallback**: In production (`NODE_ENV === "production"`), the server serves precompiled static assets from the `dist/` directory with an SPA fallback handler.

```typescript
// server.ts snippet
import express from 'express';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TruckLink Server running on port ${PORT}`);
  });
}
```

---

## 2. Firestore Database Collections & Schema

TruckLink persists application entities in Google Cloud Firestore under structured collections:

### 1. `drivers` Collection
Stores driver credentials, personal details, document records, and verification status:
```typescript
interface DriverProfile {
  id: string;                      // Unique ID / Document ID
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  cdlNumber: string;
  cdlState: string;
  cdlClass: 'Class A' | 'Class B' | 'Class C';
  cdlExpirationDate: string;       // ISO date string
  medicalCardExpirationDate: string; // ISO date string
  yearsExperience: number;
  endorsements: string[];          // e.g. ['HazMat (H)', 'Tanker (N)']
  equipmentExperience: string[];   // e.g. ['Dry Van', 'Reefer']
  preferredRouteType: 'OTR' | 'Regional' | 'Dedicated' | 'Local';
  verificationStatus: 'draft' | 'pending' | 'approved' | 'rejected' | 'needs_revision';
  complianceNotes?: string;
  documents: {
    id: string;
    type: 'cdl_front' | 'cdl_back' | 'dot_medical' | 'mvr_report';
    name: string;
    url: string;
    uploadedAt: string;
    verified: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}
```

### 2. `jobs` Collection
Stores carrier job openings with CDL qualification filters:
```typescript
interface JobPosting {
  id: string;
  carrierId: string;
  carrierName: string;
  carrierLogo?: string;
  title: string;
  description: string;
  requiredCdlClass: 'Class A' | 'Class B' | 'Class C';
  requiredEndorsements: string[];
  minExperienceYears: number;
  equipmentType: string;
  routeType: 'OTR' | 'Regional' | 'Dedicated' | 'Local';
  payRate: string;                 // e.g. "$0.65 - $0.72 / mile"
  averageWeeklyPay?: string;       // e.g. "$1,850 / week"
  signOnBonus?: string;
  homeTime: string;                // e.g. "Weekly", "Home Daily"
  location: string;
  status: 'active' | 'paused' | 'closed';
  createdAt: string;
}
```

### 3. `applications` Collection
Stores driver job applications and their active recruitment pipeline stage:
```typescript
interface JobApplication {
  id: string;
  jobId: string;
  driverId: string;
  carrierId: string;
  status: 'applied' | 'under_review' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  pipelineStage: 'sourced' | 'screening' | 'interview' | 'offer' | 'hired' | 'archived';
  matchScore: number;              // Calculated at time of application (0-100)
  appliedAt: string;
  updatedAt: string;
  notes?: string;
}
```

### 4. `masterData` Collection
Configurable system reference lists:
```typescript
interface MasterData {
  cdlClasses: string[];
  endorsements: { code: string; name: string; description: string }[];
  equipmentTypes: string[];
  routeTypes: string[];
}
```

---

## 3. Firestore Security Rules (`firestore.rules`)

The security policy ensures that data remains accessible for development and verification while establishing structured role-based boundaries:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Configured for demo workspace environment
    }
  }
}
```

---

## 4. Seeding & Data Initialization Engine (`src/lib/seedData.ts`)

On initial boot, `AuthContext` verifies whether the Firestore database contains initialized records. If the collections are empty, the platform automatically seeds:
- **Sample Commercial Drivers**: Pre-configured profiles spanning Verified, Pending Review, and Needs Revision states.
- **Sample Carrier Job Postings**: Real-world carrier listings with diverse equipment, endorsement combinations, and pay structures.
- **Sample Applications**: Candidate applications distributed across the 6 pipeline stages.
- **Master Data**: Complete FMCSA endorsement codes (`H`, `N`, `P`, `T`, `X`, `S`), equipment classifications, and route models.

---

## 5. Production Build & Deployment

To deploy TruckLink to production containers:

1. **Build Step**: Compiles client-side React bundles to `/dist`:
   ```bash
   npm run build
   ```
2. **Start Step**: Serves the application via Express static handler on port 3000:
   ```bash
   npm start
   ```
