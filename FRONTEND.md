# Frontend Architecture & Documentation — TruckLink

This document provides a comprehensive technical overview of the TruckLink frontend architecture, state management patterns, component hierarchies, qualification matching engine, and styling guidelines.

---

## 1. Architectural Overview

TruckLink's frontend is built using **React 18**, **TypeScript**, and **Tailwind CSS**. It follows a role-centric single-page application (SPA) architecture designed for responsive performance across desktop and mobile form factors.

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                             │
│  ┌───────────────────────┐  ┌────────────────────────────┐  │
│  │      DemoRoleBar      │  │        Header (Nav)        │  │
│  └───────────────────────┘  └────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Role-Based Active Dashboard Workspace       │  │
│  │  [DriverDashboard] [RecruiterDashboard] [AdminDash]   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │             Toast Notification Container              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. State Management (`AuthContext.tsx`)

State is managed through React Context (`AuthContext`), combining local state speed with background cloud synchronization to Cloud Firestore.

### Core State Properties:
- `currentRole`: Active persona (`'driver' | 'recruiter' | 'admin'`).
- `currentUser`: Profile information for the currently active simulated user.
- `drivers`: Collection of registered commercial drivers with document links, endorsements, verification status, and audit notes.
- `jobs`: List of active carrier postings with required CDL specifications.
- `applications`: Job application tracking records with pipeline stage states.
- `masterData`: Configurable lists of CDL classes, endorsements, equipment types, and route options.
- `toasts`: Array of active floating notifications (`{ id, message, type }`).

### Key Actions:
- `updateDriverProfile(driverId, updates)`: Updates driver records and syncs to Firestore.
- `createJob(jobData)`: Publishes a new carrier opening.
- `applyForJob(driverId, jobId)`: Submits a new application with initial `'applied'` status.
- `updateApplicationStage(applicationId, newStage)`: Advances candidates along the hiring pipeline.
- `reviewDriver(driverId, status, notes, adminName)`: Performs an administrative compliance audit.
- `resetToDemoData()`: Clears customized state and re-seeds original demo datasets.

---

## 3. Intelligent Match Engine (`src/lib/matching.ts`)

The matching algorithm powers the recruiter candidate discovery view and the driver job recommendations feed. It scores driver-job compatibility on a **0–100 scale** using weighted criteria:

| Dimension | Weight | Criteria & Rules |
| :--- | :---: | :--- |
| **CDL Class Hierarchy** | **35 pts** | Class A fulfills Class A, B, and C requirements. Class B fulfills B and C. Class C only fulfills C. Partial match yields 10 pts; mismatch yields 0 pts. |
| **Endorsements** | **25 pts** | Evaluates required endorsements (HazMat `H`, Tanker `N`, Doubles/Triples `T`, Passenger `P`). Score scales based on the proportion of mandatory endorsements possessed. |
| **Experience** | **20 pts** | Full points if `driver.yearsExperience >= job.minExperienceYears`. Pro-rated points if within 70% of requirement. |
| **Equipment Fit** | **10 pts** | Checks if driver has verified experience with job's specific equipment (Dry Van, Reefer, Flatbed, Tanker, etc.). |
| **Route Alignment** | **10 pts** | Checks if driver's route preference matches job route type (OTR, Regional, Dedicated, Local). |

---

## 4. Component Directory Structure

### Common Components (`/src/components/common`)
- **`DemoRoleBar.tsx`**: Top persistent role switch toolbar for toggling between Driver, Recruiter, and Admin modes with role badges.
- **`Header.tsx`**: Application brand header with quick stats, active role indicators, and reset demo data action.
- **`StatusBadge.tsx`**: Reusable color-coded badge component for CDL verification statuses, application pipeline stages, and document states.
- **`DocumentViewerModal.tsx`**: Interactive document inspector with zoom controls, rotation, verification metadata, and quick audit actions.

### Driver Components (`/src/components/driver`)
- **`DriverDashboard.tsx`**: Driver workspace container with tab navigation (My Profile, Opportunities, My Applications).
- **`DriverStatusBanner.tsx`**: Prominent compliance status banner indicating if the profile is `Approved`, `Pending Review`, `Needs Revision`, or `Draft`.
- **`DriverProfileForm.tsx`**: Comprehensive credential form for personal data, CDL class, endorsements, medical expiration, and document uploads.
- **`DriverOpportunities.tsx`**: Carrier job feed with instant compatibility fit tags, filters, and 1-click application submissions.
- **`DriverApplicationsView.tsx`**: Application history tracker displaying status progression, applied dates, and carrier details.

### Recruiter Components (`/src/components/recruiter`)
- **`RecruiterDashboard.tsx`**: Recruiter workspace container for candidate discovery, pipeline management, and job postings.
- **`DriverMatchingView.tsx`**: Candidate search engine with match filtering, endorsement breakdown chips, and quick invite/source buttons.
- **`CandidatePipelineView.tsx`**: 6-stage Kanban pipeline (`Sourced`, `Screening`, `Interview`, `Offer`, `Hired`, `Archived`) with stage transition actions.
- **`JobPostModal.tsx`**: Modal form to author and publish carrier job listings with endorsement checkboxes and pay structure settings.

### Compliance Admin Components (`/src/components/admin`)
- **`AdminDashboard.tsx`**: Compliance center featuring the Driver Verification Queue, Platform Analytics, and Master Data configuration.
- **`DriverReviewModal.tsx`**: In-depth driver credential audit dialog with CDL license inspect, medical card verification, and decision submission.
- **`AnalyticsView.tsx`**: Safety and onboarding performance metrics, compliance charts, and throughput statistics.
- **`MasterDataManager.tsx`**: Admin tool to manage standard platform equipment types, route types, and endorsements.

---

## 5. UI Design & Styling Philosophy

- **Tailwind CSS Utility Design**: Pure Tailwind styling without arbitrary CSS classes.
- **Color Semantics**:
  - **Slate & Neutral Canvas** (`bg-slate-50`, `bg-slate-100`, `bg-white`) for clean contrast.
  - **Primary Indigo & Blue** (`text-indigo-600`, `bg-blue-600`) for primary navigation and CTAs.
  - **Emerald Green** (`bg-emerald-500`, `text-emerald-700`) for Verified/Approved compliance states.
  - **Amber/Orange** (`bg-amber-500`, `text-amber-700`) for Pending and Action Required states.
  - **Rose/Red** (`bg-rose-500`, `text-rose-700`) for Rejected or Expired credential warnings.
- **Accessibility & UX**: All interactive elements feature minimum 44px touch targets on mobile, high contrast typography, and accessible keyboard focus states.
