export type UserRole = 'driver' | 'recruiter' | 'admin';

export type DriverProfileStatus = 'pending' | 'approved' | 'changes_requested' | 'rejected';

export type ApplicationStatus = 'applied' | 'shortlisted' | 'contacted' | 'interviewing' | 'offered' | 'hired' | 'rejected';

export type CDLClass = 'Class A' | 'Class B' | 'Class C';

export interface StatusHistoryEntry {
  status: DriverProfileStatus;
  timestamp: string;
  note?: string;
  changedBy: string;
  adminName?: string;
}

export interface DriverDocument {
  id: string;
  name: string;
  type: 'cdl_front' | 'cdl_back' | 'dot_medical' | 'mvr' | 'twic';
  url: string;
  uploadedAt: string;
  expirationDate?: string;
  verified?: boolean;
}

export interface DriverProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zipCode: string;
  avatarUrl?: string;
  
  // CDL & Qualifications
  cdlClass: CDLClass;
  cdlNumber: string;
  cdlState: string;
  cdlExpirationDate: string;
  endorsements: string[]; // e.g. ["HazMat (H)", "Tanker (N)", "Doubles/Triples (T)", "TWIC"]
  experienceYears: number;
  cleanMvr: boolean;
  mvrViolationsCount: number;
  
  // Preferences & Capabilities
  equipmentTypes: string[]; // e.g. ["Dry Van", "Reefer", "Flatbed", "Tanker"]
  preferredRoutes: string[]; // e.g. ["OTR", "Regional", "Local / Home Daily", "Dedicated"]
  availability: 'immediate' | 'two_weeks' | 'flexible' | 'specific_date';
  availableFromDate?: string;
  targetPayPerMile?: number; // e.g. 0.70
  targetWeeklyGross?: number; // e.g. 2000
  bio?: string;
  
  // Documents & Verification
  documents: DriverDocument[];
  
  // Moderation status
  status: DriverProfileStatus;
  statusHistory: StatusHistoryEntry[];
  adminFeedback?: string;
  moderatedAt?: string;
  moderatedBy?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  companyName: string;
  dotNumber: string;
  mcNumber: string;
  fleetSize: string; // e.g. "1-20 trucks", "21-100 trucks", "100+ trucks"
  headquarters: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  companyBio?: string;
  logoUrl?: string;
  status: 'active' | 'suspended' | 'pending';
  verifiedAt?: string;
  createdAt: string;
}

export interface JobPosting {
  id: string;
  recruiterId: string;
  companyName: string;
  title: string;
  description: string;
  routeType: string;
  equipmentType: string;
  cdlClassRequired: CDLClass;
  endorsementsRequired: string[];
  minExperienceYears: number;
  payDescription: string; // e.g. "$0.68 - $0.75 CPM + $5k Sign-On Bonus"
  avgWeeklyPay: number;
  operatingRegions: string[]; // e.g. ["Midwest", "Southeast", "National"]
  hiringRadiusMiles?: number;
  benefits: string[]; // e.g. ["Health/Dental/Vision", "401(k) 4% Match", "New 2024 Freightliners", "Weekly Direct Deposit"]
  status: 'active' | 'paused' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  driverId: string;
  driverName: string;
  driverEmail: string;
  driverPhone: string;
  driverCdlClass: CDLClass;
  driverExperience: number;
  recruiterId: string;
  status: ApplicationStatus;
  driverNote?: string;
  recruiterNotes?: string;
  matchScore: number;
  matchBreakdown?: {
    cdlScore: number;
    endorsementScore: number;
    experienceScore: number;
    equipmentScore: number;
    routeScore: number;
    reasons: string[];
  };
  appliedAt: string;
  updatedAt: string;
  interviewDate?: string;
}

export interface MatchResult {
  driver: DriverProfile;
  job?: JobPosting;
  overallScore: number; // 0 - 100
  cdlClassMatch: boolean;
  endorsementsMatched: string[];
  endorsementsMissing: string[];
  experienceMatch: boolean;
  equipmentMatch: boolean;
  routeMatch: boolean;
  reasons: string[];
}

export interface MasterData {
  endorsementTypes: string[];
  equipmentTypes: string[];
  routeTypes: string[];
  regions: string[];
}

export interface PlatformAnalytics {
  totalDrivers: number;
  pendingDrivers: number;
  approvedDrivers: number;
  rejectedDrivers: number;
  totalRecruiters: number;
  activeJobs: number;
  totalApplications: number;
  hiresMade: number;
  avgModerationTurnaroundMinutes: number;
}
