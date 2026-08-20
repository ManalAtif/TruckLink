import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  UserRole,
  DriverProfile,
  RecruiterProfile,
  JobPosting,
  JobApplication,
  MasterData,
  DriverProfileStatus,
  ApplicationStatus,
  PlatformAnalytics,
} from '../types';
import {
  INITIAL_MASTER_DATA,
  SAMPLE_DRIVERS,
  SAMPLE_RECRUITERS,
  SAMPLE_JOBS,
  SAMPLE_APPLICATIONS,
} from '../lib/seedData';
import confetti from 'canvas-confetti';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AuthContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeDriverId: string;
  setActiveDriverId: (id: string) => void;
  activeRecruiterId: string;
  setActiveRecruiterId: (id: string) => void;
  
  // Data state
  drivers: DriverProfile[];
  recruiters: RecruiterProfile[];
  jobs: JobPosting[];
  applications: JobApplication[];
  masterData: MasterData;
  analytics: PlatformAnalytics;
  isLoading: boolean;
  
  // Computed active profiles
  currentDriver: DriverProfile | undefined;
  currentRecruiter: RecruiterProfile | undefined;
  
  // Driver Actions
  updateDriverProfile: (driverData: Partial<DriverProfile>) => Promise<void>;
  submitDriverForReview: (driverId?: string) => Promise<void>;
  applyToJob: (job: JobPosting, note?: string) => Promise<void>;
  
  // Recruiter Actions
  createJobPosting: (jobData: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'recruiterId' | 'companyName'>) => Promise<string>;
  updateJobPosting: (jobId: string, jobData: Partial<JobPosting>) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus, recruiterNotes?: string, interviewDate?: string) => Promise<void>;
  
  // Admin Actions
  approveDriver: (driverId: string, adminComment?: string) => Promise<void>;
  rejectDriver: (driverId: string, reason: string) => Promise<void>;
  requestDriverChanges: (driverId: string, changeRequestNote: string) => Promise<void>;
  toggleRecruiterStatus: (recruiterId: string, status: 'active' | 'suspended') => Promise<void>;
  updateMasterDataList: (category: keyof MasterData, items: string[]) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  
  // Toast notifications
  toasts: ToastItem[];
  removeToast: (id: string) => void;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('driver');
  const [activeDriverId, setActiveDriverId] = useState<string>('driver-john-reynolds');
  const [activeRecruiterId, setActiveRecruiterId] = useState<string>('recruiter-apex-freight');
  
  const [drivers, setDrivers] = useState<DriverProfile[]>(SAMPLE_DRIVERS);
  const [recruiters, setRecruiters] = useState<RecruiterProfile[]>(SAMPLE_RECRUITERS);
  const [jobs, setJobs] = useState<JobPosting[]>(SAMPLE_JOBS);
  const [applications, setApplications] = useState<JobApplication[]>(SAMPLE_APPLICATIONS);
  const [masterData, setMasterData] = useState<MasterData>(INITIAL_MASTER_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
    setToastMessage({ text: message, type });

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  // Seed Firestore if empty
  const seedFirestoreIfEmpty = async () => {
    try {
      const driverSnap = await getDocs(collection(db, 'driverProfiles'));
      if (driverSnap.empty) {
        console.log('Seeding initial Firestore database with TruckLink data...');
        const batch = writeBatch(db);

        // Seed drivers
        SAMPLE_DRIVERS.forEach((d) => {
          const ref = doc(db, 'driverProfiles', d.id);
          batch.set(ref, d);
        });

        // Seed recruiters
        SAMPLE_RECRUITERS.forEach((r) => {
          const ref = doc(db, 'recruiterProfiles', r.id);
          batch.set(ref, r);
        });

        // Seed jobs
        SAMPLE_JOBS.forEach((j) => {
          const ref = doc(db, 'jobs', j.id);
          batch.set(ref, j);
        });

        // Seed applications
        SAMPLE_APPLICATIONS.forEach((a) => {
          const ref = doc(db, 'applications', a.id);
          batch.set(ref, a);
        });

        // Seed master data
        const masterRef = doc(db, 'systemMasterData', 'config');
        batch.set(masterRef, INITIAL_MASTER_DATA);

        await batch.commit();
        console.log('Firestore seed completed successfully.');
      }
    } catch (err) {
      console.warn('Note on Firestore init seed (using local state fallback if offline):', err);
    }
  };

  // Subscribe to Firestore collections
  useEffect(() => {
    seedFirestoreIfEmpty();

    const unsubDrivers = onSnapshot(
      collection(db, 'driverProfiles'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DriverProfile));
          setDrivers(list);
        }
        setIsLoading(false);
      },
      (err) => {
        console.warn('Driver subscription fallback to local cache:', err);
        setIsLoading(false);
      }
    );

    const unsubRecruiters = onSnapshot(
      collection(db, 'recruiterProfiles'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RecruiterProfile));
          setRecruiters(list);
        }
      },
      (err) => console.warn('Recruiter subscription note:', err)
    );

    const unsubJobs = onSnapshot(
      collection(db, 'jobs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as JobPosting));
          setJobs(list);
        }
      },
      (err) => console.warn('Jobs subscription note:', err)
    );

    const unsubApplications = onSnapshot(
      collection(db, 'applications'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as JobApplication));
          setApplications(list);
        }
      },
      (err) => console.warn('Applications subscription note:', err)
    );

    const unsubMaster = onSnapshot(
      doc(db, 'systemMasterData', 'config'),
      (docSnap) => {
        if (docSnap.exists()) {
          setMasterData(docSnap.data() as MasterData);
        }
      },
      (err) => console.warn('Master data subscription note:', err)
    );

    return () => {
      unsubDrivers();
      unsubRecruiters();
      unsubJobs();
      unsubApplications();
      unsubMaster();
    };
  }, []);

  const currentDriver = drivers.find((d) => d.id === activeDriverId) || drivers[0];
  const currentRecruiter = recruiters.find((r) => r.id === activeRecruiterId) || recruiters[0];

  // Computed Analytics
  const analytics: PlatformAnalytics = {
    totalDrivers: drivers.length,
    pendingDrivers: drivers.filter((d) => d.status === 'pending').length,
    approvedDrivers: drivers.filter((d) => d.status === 'approved').length,
    rejectedDrivers: drivers.filter((d) => d.status === 'rejected').length,
    totalRecruiters: recruiters.length,
    activeJobs: jobs.filter((j) => j.status === 'active').length,
    totalApplications: applications.length,
    hiresMade: applications.filter((a) => a.status === 'hired').length,
    avgModerationTurnaroundMinutes: 34,
  };

  // Driver: Update Profile
  const updateDriverProfile = async (driverData: Partial<DriverProfile>) => {
    const targetId = activeDriverId || currentDriver?.id;
    if (!targetId) return;

    const updated = {
      ...driverData,
      updatedAt: new Date().toISOString(),
    };

    // Update local state immediately for instant UX
    setDrivers((prev) =>
      prev.map((d) => (d.id === targetId ? ({ ...d, ...updated } as DriverProfile) : d))
    );

    try {
      await updateDoc(doc(db, 'driverProfiles', targetId), updated);
      showToast('Profile information saved successfully', 'success');
    } catch (err) {
      console.warn('Firestore update error (persisted locally):', err);
      showToast('Profile saved locally', 'info');
    }
  };

  // Driver: Submit Profile for Moderation Review
  const submitDriverForReview = async (driverId?: string) => {
    const targetId = driverId || activeDriverId;
    const target = drivers.find((d) => d.id === targetId);
    if (!target) return;

    const newHistoryEntry = {
      status: 'pending' as DriverProfileStatus,
      timestamp: new Date().toISOString(),
      changedBy: target.userId,
      note: 'Driver submitted profile and credentials for admin moderation review.',
    };

    const updatePayload = {
      status: 'pending' as DriverProfileStatus,
      statusHistory: [...(target.statusHistory || []), newHistoryEntry],
      updatedAt: new Date().toISOString(),
    };

    setDrivers((prev) =>
      prev.map((d) => (d.id === targetId ? ({ ...d, ...updatePayload } as DriverProfile) : d))
    );

    try {
      await updateDoc(doc(db, 'driverProfiles', targetId), updatePayload);
      showToast('Profile submitted to admin moderation queue!', 'success');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (err) {
      console.warn('Submit review fallback:', err);
      showToast('Profile submitted for moderation', 'success');
    }
  };

  // Driver: Apply to Job
  const applyToJob = async (job: JobPosting, note?: string) => {
    if (!currentDriver) return;

    // Check if already applied
    const existing = applications.find(
      (a) => a.jobId === job.id && a.driverId === currentDriver.id
    );
    if (existing) {
      showToast('You have already applied to this position!', 'warning');
      return;
    }

    const newApp: JobApplication = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      driverId: currentDriver.id,
      driverName: currentDriver.fullName,
      driverEmail: currentDriver.email,
      driverPhone: currentDriver.phone,
      driverCdlClass: currentDriver.cdlClass,
      driverExperience: currentDriver.experienceYears,
      recruiterId: job.recruiterId,
      status: 'applied',
      driverNote: note || 'I am interested in this opportunity and ready to discuss terms.',
      matchScore: 92,
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setApplications((prev) => [newApp, ...prev]);

    try {
      await setDoc(doc(db, 'applications', newApp.id), newApp);
      showToast(`Application submitted to ${job.companyName}!`, 'success');
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
    } catch (err) {
      console.warn('Apply fallback:', err);
      showToast(`Application sent to ${job.companyName}`, 'success');
    }
  };

  // Recruiter: Create Job Posting
  const createJobPosting = async (
    jobData: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'recruiterId' | 'companyName'>
  ): Promise<string> => {
    const newId = `job-${Date.now()}`;
    const newJob: JobPosting = {
      ...jobData,
      id: newId,
      recruiterId: activeRecruiterId,
      companyName: currentRecruiter?.companyName || 'Carrier Logistics',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setJobs((prev) => [newJob, ...prev]);

    try {
      await setDoc(doc(db, 'jobs', newId), newJob);
      showToast('Job position published and live for matching drivers!', 'success');
    } catch (err) {
      console.warn('Job create fallback:', err);
      showToast('Job position published', 'success');
    }
    return newId;
  };

  // Recruiter: Update Job
  const updateJobPosting = async (jobId: string, jobData: Partial<JobPosting>) => {
    const updatePayload = {
      ...jobData,
      updatedAt: new Date().toISOString(),
    };

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? ({ ...j, ...updatePayload } as JobPosting) : j))
    );

    try {
      await updateDoc(doc(db, 'jobs', jobId), updatePayload);
      showToast('Job posting updated', 'success');
    } catch (err) {
      console.warn('Job update fallback:', err);
    }
  };

  // Recruiter: Update Application Status
  const updateApplicationStatus = async (
    applicationId: string,
    status: ApplicationStatus,
    recruiterNotes?: string,
    interviewDate?: string
  ) => {
    const payload: Partial<JobApplication> = {
      status,
      updatedAt: new Date().toISOString(),
      ...(recruiterNotes ? { recruiterNotes } : {}),
      ...(interviewDate ? { interviewDate } : {}),
    };

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? ({ ...a, ...payload } as JobApplication) : a))
    );

    try {
      await updateDoc(doc(db, 'applications', applicationId), payload);
      showToast(`Candidate stage updated to: ${status.toUpperCase()}`, 'success');
      if (status === 'hired') {
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.warn('App status update fallback:', err);
      showToast(`Candidate stage updated to: ${status}`, 'success');
    }
  };

  // Admin: Approve Driver
  const approveDriver = async (driverId: string, adminComment?: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const newHistoryEntry = {
      status: 'approved' as DriverProfileStatus,
      timestamp: new Date().toISOString(),
      changedBy: 'admin-marcus',
      adminName: 'Marcus Vance (Platform Admin)',
      note: adminComment || 'Profile credentials and CDL documentation verified. Approved for carrier matching.',
    };

    // Mark documents as verified
    const verifiedDocs = (driver.documents || []).map((doc) => ({ ...doc, verified: true }));

    const updatePayload = {
      status: 'approved' as DriverProfileStatus,
      statusHistory: [...(driver.statusHistory || []), newHistoryEntry],
      documents: verifiedDocs,
      adminFeedback: adminComment || 'Profile and credentials verified.',
      moderatedAt: new Date().toISOString(),
      moderatedBy: 'Marcus Vance',
      updatedAt: new Date().toISOString(),
    };

    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? ({ ...d, ...updatePayload } as DriverProfile) : d))
    );

    try {
      await updateDoc(doc(db, 'driverProfiles', driverId), updatePayload);
      showToast(`Driver ${driver.fullName} APPROVED! Profile is now visible to recruiters.`, 'success');
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      console.warn('Approve fallback:', err);
      showToast(`Driver ${driver.fullName} approved`, 'success');
    }
  };

  // Admin: Reject Driver
  const rejectDriver = async (driverId: string, reason: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const newHistoryEntry = {
      status: 'rejected' as DriverProfileStatus,
      timestamp: new Date().toISOString(),
      changedBy: 'admin-marcus',
      adminName: 'Marcus Vance (Platform Admin)',
      note: `Rejected: ${reason}`,
    };

    const updatePayload = {
      status: 'rejected' as DriverProfileStatus,
      statusHistory: [...(driver.statusHistory || []), newHistoryEntry],
      adminFeedback: reason,
      moderatedAt: new Date().toISOString(),
      moderatedBy: 'Marcus Vance',
      updatedAt: new Date().toISOString(),
    };

    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? ({ ...d, ...updatePayload } as DriverProfile) : d))
    );

    try {
      await updateDoc(doc(db, 'driverProfiles', driverId), updatePayload);
      showToast(`Driver ${driver.fullName} rejected with feedback.`, 'warning');
    } catch (err) {
      console.warn('Reject fallback:', err);
      showToast(`Driver profile rejected`, 'warning');
    }
  };

  // Admin: Request Changes
  const requestDriverChanges = async (driverId: string, changeRequestNote: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const newHistoryEntry = {
      status: 'changes_requested' as DriverProfileStatus,
      timestamp: new Date().toISOString(),
      changedBy: 'admin-marcus',
      adminName: 'Marcus Vance (Platform Admin)',
      note: `Changes requested: ${changeRequestNote}`,
    };

    const updatePayload = {
      status: 'changes_requested' as DriverProfileStatus,
      statusHistory: [...(driver.statusHistory || []), newHistoryEntry],
      adminFeedback: changeRequestNote,
      moderatedAt: new Date().toISOString(),
      moderatedBy: 'Marcus Vance',
      updatedAt: new Date().toISOString(),
    };

    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? ({ ...d, ...updatePayload } as DriverProfile) : d))
    );

    try {
      await updateDoc(doc(db, 'driverProfiles', driverId), updatePayload);
      showToast(`Changes requested for ${driver.fullName}. Driver notified!`, 'info');
    } catch (err) {
      console.warn('Request changes fallback:', err);
      showToast(`Changes requested for driver`, 'info');
    }
  };

  // Admin: Toggle Recruiter Status
  const toggleRecruiterStatus = async (recruiterId: string, status: 'active' | 'suspended') => {
    const updatePayload = { status };
    setRecruiters((prev) =>
      prev.map((r) => (r.id === recruiterId ? { ...r, status } : r))
    );

    try {
      await updateDoc(doc(db, 'recruiterProfiles', recruiterId), updatePayload);
      showToast(`Recruiter account marked as ${status.toUpperCase()}`, 'info');
    } catch (err) {
      console.warn('Toggle recruiter fallback:', err);
    }
  };

  // Admin: Master Data
  const updateMasterDataList = async (category: keyof MasterData, items: string[]) => {
    const updated = {
      ...masterData,
      [category]: items,
    };
    setMasterData(updated);

    try {
      await setDoc(doc(db, 'systemMasterData', 'config'), updated);
      showToast(`Master data for ${category} updated!`, 'success');
    } catch (err) {
      console.warn('Master data update fallback:', err);
    }
  };

  // Reset to initial demo data
  const resetToDemoData = async () => {
    setDrivers(SAMPLE_DRIVERS);
    setRecruiters(SAMPLE_RECRUITERS);
    setJobs(SAMPLE_JOBS);
    setApplications(SAMPLE_APPLICATIONS);
    setMasterData(INITIAL_MASTER_DATA);
    setActiveDriverId('driver-john-reynolds');
    setActiveRecruiterId('recruiter-apex-freight');

    try {
      const batch = writeBatch(db);
      SAMPLE_DRIVERS.forEach((d) => batch.set(doc(db, 'driverProfiles', d.id), d));
      SAMPLE_RECRUITERS.forEach((r) => batch.set(doc(db, 'recruiterProfiles', r.id), r));
      SAMPLE_JOBS.forEach((j) => batch.set(doc(db, 'jobs', j.id), j));
      SAMPLE_APPLICATIONS.forEach((a) => batch.set(doc(db, 'applications', a.id), a));
      batch.set(doc(db, 'systemMasterData', 'config'), INITIAL_MASTER_DATA);
      await batch.commit();
      showToast('Database reset to initial demo state!', 'success');
    } catch (err) {
      console.warn('Reset demo fallback:', err);
      showToast('Reset to demo data completed', 'success');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeDriverId,
        setActiveDriverId,
        activeRecruiterId,
        setActiveRecruiterId,
        drivers,
        recruiters,
        jobs,
        applications,
        masterData,
        analytics,
        isLoading,
        currentDriver,
        currentRecruiter,
        updateDriverProfile,
        submitDriverForReview,
        applyToJob,
        createJobPosting,
        updateJobPosting,
        updateApplicationStatus,
        approveDriver,
        rejectDriver,
        requestDriverChanges,
        toggleRecruiterStatus,
        updateMasterDataList,
        resetToDemoData,
        toasts,
        removeToast,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
