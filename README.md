# TruckLink — Commercial Driver Hiring & Onboarding Platform

TruckLink is an end-to-end commercial transportation recruitment and compliance management platform connecting **Class A/B/C commercial truck drivers**, **carrier recruiters**, and **compliance safety administrators**.
## https://truck-link-woad.vercel.app/
---

## 🚀 Key Features

### 1. 🚛 Commercial Driver Portal
- **Profile & Credential Onboarding**: Step-by-step driver intake collecting CDL class (Class A, B, C), endorsements (HazMat `H`, Tanker `N`, Doubles/Triples `T`, Passenger `P`), medical card expiration, years of experience, equipment experience (Dry Van, Reefer, Flatbed, Tanker), and route preference (OTR, Regional, Dedicated, Local).
- **Document Management**: Upload and inspect CDL licenses, DOT Medical Cards, and MVR reports with document status tracking.
- **Smart Opportunity Feed**: Filter and apply to carrier jobs with real-time CDL compatibility match scoring (0–100%).
- **Application Tracking**: Live status updates across all submitted carrier applications (Applied → Under Review → Interviewing → Offered → Hired).

### 2. 🏢 Carrier & Recruiter Portal
- **Job Creation & Posting**: Publish opportunities with exact CDL requirements, mandatory endorsements, minimum experience, route type, pay rates, sign-on bonuses, and terminal locations.
- **Intelligent Driver Discovery**: Search and rank FMCSA-approved drivers using multi-factor qualification matching algorithms.
- **6-Stage Recruitment Pipeline (Kanban)**: Track candidates across hiring stages with drag/action controls, one-click interview scheduling, offer generation, and onboarding.

### 3. 🛡️ Compliance & Safety Admin Portal
- **Verification Queue**: Audit submitted driver credentials and documents with inspection view.
- **Compliance Decision Engine**: One-click actions to Approve, Request Corrections, or Reject driver accounts with required audit trail notes.
- **Live Safety Analytics**: Visual compliance metrics, approval rates, average verification turnaround time, and risk distribution.
- **Master Data Manager**: Configure platform standard equipment types, endorsements, and route categories in real time.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend & Dev Server**: Express.js, TypeScript (`tsx`), Vite Middleware
- **Database & Persistence**: Google Cloud Firestore (Firebase SDK) with offline cache fallback and automatic demo data seeding
- **Security & RBAC**: Role-based access control, Firestore Security Rules

---

## 📁 Repository Structure

```
├── .env.example               # Environment variables template
├── firestore.rules            # Firestore security rules
├── firebase-applet-config.json # Firebase project configuration
├── server.ts                  # Express server & Vite development middleware
├── src/
│   ├── components/
│   │   ├── admin/             # Admin dashboard, audit review modal, analytics
│   │   ├── common/            # Header, role switcher bar, status badges, doc viewer
│   │   ├── driver/            # Driver profile form, jobs feed, applications view
│   │   └── recruiter/         # Job post modal, candidate matching, pipeline kanban
│   ├── context/
│   │   └── AuthContext.tsx    # Central state store & Firestore synchronization
│   ├── lib/
│   │   ├── firebase.ts        # Firebase client initialization
│   │   ├── matching.ts        # Driver-to-Job compatibility scoring engine
│   │   └── seedData.ts        # Initial seed database records
│   ├── types/
│   │   └── index.ts           # Shared TypeScript domain models & enums
│   ├── App.tsx                # Main view router & toast notifications
│   ├── main.tsx               # Client React entry point
│   └── index.css              # Tailwind CSS styles
├── FRONTEND.md                # In-depth frontend architectural documentation
├── BACKEND.md                 # In-depth backend, API, & database documentation
└── README.md                  # Project overview & quickstart guide
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

### 4. Start Production Server
```bash
npm start
```

---

## 🔄 Interactive Demo Workflow

You can switch roles anytime using the **Role Bar** at the top of the interface:

1. **Switch to "Compliance Admin"**:
   - Navigate to the **Verification Queue**.
   - Select a Pending driver (e.g., *Marcus Vance*).
   - Review uploaded CDL & DOT Medical documents in the viewer modal.
   - Click **Approve Driver** to certify compliance.

2. **Switch to "Carrier Recruiter"**:
   - Open **Driver Discovery** to see newly verified drivers matched against active jobs with compatibility percentages.
   - Switch to **Recruiting Pipeline** to move candidates through stages (Sourced → Screening → Interview → Offer → Hired).
   - Click **Post New Job** to define route, pay, and required CDL endorsements.

3. **Switch to "Commercial Driver"**:
   - Inspect profile verification status in the status banner.
   - View recommended jobs calculated against your CDL credentials.
   - Submit 1-click job applications and monitor status changes in real time.

---

## 📚 Detailed Documentation

- **[Frontend Architecture Guide (FRONTEND.md)](./FRONTEND.md)**
- **[Backend & Database Architecture Guide (BACKEND.md)](./BACKEND.md)**
