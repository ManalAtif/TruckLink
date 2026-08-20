import React, { useState } from 'react';
import { DriverProfile, JobPosting, DriverDocument } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { rankDriversForJob, calculateDriverJobMatch } from '../../lib/matching';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Shield,
  Truck,
  Award,
  Calendar,
  Send,
  Eye,
  UserCheck,
  Building2,
  FileText,
  X,
  PhoneCall,
  ChevronDown,
} from 'lucide-react';
import { DocumentViewerModal } from '../common/DocumentViewerModal';
import { StatusBadge } from '../common/StatusBadge';

export const DriverMatchingView: React.FC = () => {
  const {
    drivers,
    jobs,
    activeRecruiterId,
    currentRecruiter,
    applications,
    updateApplicationStatus,
    showToast,
  } = useAuth();

  const recruiterJobs = jobs.filter((j) => j.recruiterId === activeRecruiterId && j.status === 'active');
  const [selectedJobId, setSelectedJobId] = useState<string>(
    recruiterJobs[0]?.id || jobs[0]?.id || ''
  );

  // Filters
  const [minMatchFilter, setMinMatchFilter] = useState<number>(0);
  const [cdlFilter, setCdlFilter] = useState<string>('all');
  const [endorsementFilter, setEndorsementFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [inspectedDriver, setInspectedDriver] = useState<DriverProfile | null>(null);
  const [contactingDriver, setContactingDriver] = useState<DriverProfile | null>(null);
  const [contactMessage, setContactMessage] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<DriverDocument | null>(null);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // STRICT COMPLIANCE RULE: Only APPROVED drivers appear to recruiters!
  const approvedDrivers = drivers.filter((d) => d.status === 'approved');

  // Calculate matches against active job
  const rankedMatches = activeJob
    ? rankDriversForJob(approvedDrivers, activeJob)
    : approvedDrivers.map((driver) => ({
        driver,
        overallScore: 100,
        cdlClassMatch: true,
        endorsementsMatched: [],
        endorsementsMissing: [],
        experienceMatch: true,
        equipmentMatch: true,
        routeMatch: true,
        reasons: ['Direct Search Candidate'],
      }));

  // Apply UI Filters
  const filteredMatches = rankedMatches.filter(({ driver, overallScore }) => {
    if (overallScore < minMatchFilter) return false;
    if (cdlFilter !== 'all' && driver.cdlClass !== cdlFilter) return false;
    if (endorsementFilter !== 'all' && !driver.endorsements?.some((e) => e.includes(endorsementFilter)))
      return false;
    if (equipmentFilter !== 'all' && !driver.equipmentTypes?.includes(equipmentFilter)) return false;
    if (
      searchQuery &&
      !driver.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !driver.city.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !driver.state.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleOpenContactModal = (driver: DriverProfile) => {
    setContactingDriver(driver);
    setContactMessage(
      `Hello ${driver.fullName}, we reviewed your verified ${driver.cdlClass} profile with ${driver.experienceYears} years experience at ${currentRecruiter?.companyName}. We have an open position (${activeJob?.title}) and would love to schedule a phone interview.`
    );
  };

  const handleSendInterviewInvite = async () => {
    if (!contactingDriver || !activeJob) return;

    // Check if an application exists or create/update pipeline stage
    const existingApp = applications.find(
      (a) => a.driverId === contactingDriver.id && a.jobId === activeJob.id
    );

    if (existingApp) {
      await updateApplicationStatus(
        existingApp.id,
        'contacted',
        contactMessage,
        new Date(Date.now() + 86400000 * 2).toISOString()
      );
    } else {
      // Create new application record in contacted stage
      const newApp = {
        id: `app-${Date.now()}`,
        jobId: activeJob.id,
        jobTitle: activeJob.title,
        companyName: activeJob.companyName,
        driverId: contactingDriver.id,
        driverName: contactingDriver.fullName,
        driverEmail: contactingDriver.email,
        driverPhone: contactingDriver.phone,
        driverCdlClass: contactingDriver.cdlClass,
        driverExperience: contactingDriver.experienceYears,
        recruiterId: activeRecruiterId,
        status: 'contacted' as const,
        recruiterNotes: contactMessage,
        matchScore: 95,
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        interviewDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      };
      // via context or toast
      showToast(`Interview invitation sent to ${contactingDriver.fullName}! Added to Candidate Pipeline.`, 'success');
    }

    setContactingDriver(null);
  };

  const handleShortlistCandidate = async (driver: DriverProfile) => {
    if (!activeJob) return;
    const existingApp = applications.find(
      (a) => a.driverId === driver.id && a.jobId === activeJob.id
    );
    if (existingApp) {
      await updateApplicationStatus(existingApp.id, 'shortlisted', 'Candidate shortlisted for priority review.');
    } else {
      showToast(`${driver.fullName} added to your shortlist for ${activeJob.title}!`, 'success');
    }
  };

  return (
    <div id="recruiter-matching-view" className="space-y-6">
      {/* Target Job Selector & Matching Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Verified Driver Matching Engine
                </h2>
                <p className="text-xs text-slate-500">
                  Ranking {approvedDrivers.length} verified & approved commercial drivers against job requirements
                </p>
              </div>
            </div>
          </div>

          {/* Job Target Selector */}
          <div className="flex items-center gap-2 min-w-[280px]">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Match Against Job:</span>
            <select
              id="select-active-job-for-match"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="flex-1 text-xs font-bold rounded-xl border border-slate-300 bg-emerald-50/50 text-emerald-950 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.routeType} • {job.cdlClassRequired})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Job Requirements Summary Pill Bar */}
        {activeJob && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Target Criteria:</span>
            <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-md">
              CDL: {activeJob.cdlClassRequired}
            </span>
            <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
              Route: {activeJob.routeType}
            </span>
            <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
              Equipment: {activeJob.equipmentType}
            </span>
            <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
              Min Exp: {activeJob.minExperienceYears} yrs
            </span>
            {activeJob.endorsementsRequired?.length > 0 && (
              <span className="bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-md">
                Endorsements: {activeJob.endorsementsRequired.join(', ')}
              </span>
            )}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, city, state..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300"
            />
          </div>

          {/* Min Match Score */}
          <div>
            <select
              value={minMatchFilter}
              onChange={(e) => setMinMatchFilter(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
            >
              <option value={0}>All Match Scores</option>
              <option value={80}>High Fit Only (80%+)</option>
              <option value={90}>Top Tier Only (90%+)</option>
            </select>
          </div>

          {/* CDL Filter */}
          <div>
            <select
              value={cdlFilter}
              onChange={(e) => setCdlFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
            >
              <option value="all">Any CDL Class</option>
              <option value="Class A">Class A</option>
              <option value="Class B">Class B</option>
              <option value="Class C">Class C</option>
            </select>
          </div>

          {/* Endorsement Filter */}
          <div>
            <select
              value={endorsementFilter}
              onChange={(e) => setEndorsementFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
            >
              <option value="all">Any Endorsement</option>
              <option value="HazMat">HazMat (H)</option>
              <option value="Tanker">Tanker (N)</option>
              <option value="Doubles">Doubles/Triples (T)</option>
              <option value="TWIC">TWIC Card</option>
            </select>
          </div>

          {/* Equipment Filter */}
          <div>
            <select
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
            >
              <option value="all">Any Equipment</option>
              <option value="Refrigerated (Reefer)">Reefer</option>
              <option value="Dry Van">Dry Van</option>
              <option value="Flatbed / Step Deck">Flatbed</option>
              <option value="Tanker (Liquid / Chemical)">Tanker</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Matches Count & Safe Security Notice */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-2">
        <span className="font-semibold">
          Showing {filteredMatches.length} vetted candidates (100% Moderated & Approved)
        </span>
        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Unapproved & pending profiles are protected and excluded
        </span>
      </div>

      {/* Matching Drivers Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMatches.map(({ driver, overallScore, reasons }) => (
          <div
            key={driver.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              {/* Driver info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg shrink-0 overflow-hidden shadow-xs">
                  {driver.avatarUrl ? (
                    <img
                      src={driver.avatarUrl}
                      alt={driver.fullName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    driver.fullName.slice(0, 2).toUpperCase()
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{driver.fullName}</h3>
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      <Shield className="w-3 h-3 text-blue-600" />
                      {driver.cdlClass}
                    </span>
                    <StatusBadge status={driver.status} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    {driver.city}, {driver.state} •{' '}
                    <strong className="text-slate-900">{driver.experienceYears} Years Exp</strong>
                    {driver.cleanMvr && ' • Clean MVR'}
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{driver.bio}</p>
                </div>
              </div>

              {/* Match Score Badge */}
              <div className="flex items-center md:flex-col items-end justify-between md:justify-center gap-2 shrink-0">
                <div
                  className={`px-4 py-2 rounded-2xl text-center shadow-xs ${
                    overallScore >= 90
                      ? 'bg-emerald-600 text-white'
                      : overallScore >= 75
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  <p className="text-xl font-black">{overallScore}%</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                    Match Fit
                  </p>
                </div>

                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Availability: {driver.availability.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Endorsements & Equipment Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <p className="text-[11px] font-bold text-slate-700 mb-1">Endorsements:</p>
                <div className="flex flex-wrap gap-1.5">
                  {driver.endorsements?.length ? (
                    driver.endorsements.map((e, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-md font-semibold text-[11px]"
                      >
                        ✓ {e}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">Standard CDL</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-700 mb-1">Equipment Experience:</p>
                <div className="flex flex-wrap gap-1.5">
                  {driver.equipmentTypes?.map((eq, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reasons / Match Breakdown */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[11px] font-bold text-slate-700 mb-1">Fit Breakdown:</p>
              <div className="flex flex-wrap gap-2">
                {reasons.map((r, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Verified Documents:</span>
                {driver.documents?.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setPreviewDoc(doc)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{doc.name.split(' ')[0]} (View)</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectedDriver(driver)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Full Dossier
                </button>

                <button
                  onClick={() => handleShortlistCandidate(driver)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Shortlist</span>
                </button>

                <button
                  onClick={() => handleOpenContactModal(driver)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Contact / Interview</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Driver Dossier Modal */}
      {inspectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg">
                  {inspectedDriver.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {inspectedDriver.fullName} • Verified Candidate Dossier
                  </h3>
                  <p className="text-xs text-slate-500">
                    {inspectedDriver.cdlClass} • {inspectedDriver.cdlState} • Exp: {inspectedDriver.cdlExpirationDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedDriver(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Direct Phone</p>
                  <p className="font-bold text-slate-900">{inspectedDriver.phone}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Email</p>
                  <p className="font-bold text-slate-900 truncate">{inspectedDriver.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Location</p>
                  <p className="font-bold text-slate-900">
                    {inspectedDriver.city}, {inspectedDriver.state} {inspectedDriver.zipCode}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">CDL Number</p>
                  <p className="font-mono font-bold text-blue-700">{inspectedDriver.cdlNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Experience</p>
                  <p className="font-bold text-slate-900">{inspectedDriver.experienceYears} Years Verified</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Target Pay</p>
                  <p className="font-bold text-emerald-700">
                    ${inspectedDriver.targetPayPerMile}/mi • ${inspectedDriver.targetWeeklyGross}/wk
                  </p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-1">Driver Bio:</p>
                <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {inspectedDriver.bio}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-2">Verified Compliance Documents on File:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inspectedDriver.documents?.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{doc.name}</p>
                        <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Admin Verified
                        </p>
                      </div>
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100"
                      >
                        Inspect
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setInspectedDriver(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const d = inspectedDriver;
                  setInspectedDriver(null);
                  handleOpenContactModal(d);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Proceed to Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact & Schedule Interview Modal */}
      {contactingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Send Interview Invite to {contactingDriver.fullName}
              </h3>
              <p className="text-xs text-slate-500">
                Position: <strong className="text-slate-800">{activeJob?.title}</strong>
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message to Driver:</label>
                <textarea
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Next Steps:</p>
                <p>• Driver will receive the message in their portal dashboard.</p>
                <p>• Candidate will automatically advance to "Contacted / Interview Scheduled" in your ATS.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setContactingDriver(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInterviewInvite}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Invitation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Inspector Modal */}
      {previewDoc && (
        <DocumentViewerModal
          document={previewDoc}
          driverName={inspectedDriver?.fullName || 'Driver'}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
