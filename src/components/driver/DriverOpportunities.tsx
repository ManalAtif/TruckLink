import React, { useState } from 'react';
import { DriverProfile, JobPosting } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { rankJobsForDriver } from '../../lib/matching';
import {
  Briefcase,
  DollarSign,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Filter,
  Building2,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface DriverOpportunitiesProps {
  driver: DriverProfile;
}

export const DriverOpportunities: React.FC<DriverOpportunitiesProps> = ({ driver }) => {
  const { jobs, applications, applyToJob, showToast } = useAuth();

  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobPosting | null>(null);
  const [applyNote, setApplyNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Ranked jobs using matching algorithm
  const rankedResults = rankJobsForDriver(jobs, driver);

  const filteredResults = rankedResults.filter((item) => {
    if (!item.job) return false;
    if (routeFilter !== 'all' && item.job.routeType !== routeFilter) return false;
    return true;
  });

  const handleOpenApplyModal = (job: JobPosting) => {
    setSelectedJobForApply(job);
    setApplyNote(
      `Hello ${job.companyName} recruiting team, I am an experienced ${driver.cdlClass} driver with ${driver.experienceYears} years experience and active ${driver.endorsements?.join(', ')} endorsements. I am interested in your ${job.title} position.`
    );
  };

  const handleConfirmApply = async () => {
    if (!selectedJobForApply) return;
    setIsSubmitting(true);
    await applyToJob(selectedJobForApply, applyNote);
    setIsSubmitting(false);
    setSelectedJobForApply(null);
  };

  const hasApplied = (jobId: string) => {
    return applications.some((a) => a.jobId === jobId && a.driverId === driver.id);
  };

  return (
    <div id="driver-opportunities-feed" className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Matching Carrier Opportunities ({filteredResults.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Ranked by intelligent fit to your {driver.cdlClass}, endorsements, and route preferences
          </p>
        </div>

        {/* Route Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Route Type:</span>
          <select
            id="filter-job-route-type"
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Route Types</option>
            <option value="Over-The-Road (OTR)">Over-The-Road (OTR)</option>
            <option value="Regional (Home Weekly)">Regional (Home Weekly)</option>
            <option value="Local (Home Daily)">Local (Home Daily)</option>
            <option value="Dedicated Route">Dedicated Route</option>
          </select>
        </div>
      </div>

      {/* Driver Moderation Notice if not yet approved */}
      {driver.status !== 'approved' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong className="font-bold">Profile Pending Moderation:</strong> You can explore and apply to positions below. Once platform admin approves your credentials, your profile will instantly rank in recruiter search queries!
          </div>
        </div>
      )}

      {/* Opportunity Cards List */}
      <div className="space-y-4">
        {filteredResults.map(({ job, overallScore, reasons }) => {
          if (!job) return null;
          const applied = hasApplied(job.id);

          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Job Title & Carrier */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                        overallScore >= 90
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : overallScore >= 75
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {overallScore}% Match Fit
                    </span>

                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {job.companyName}
                    </span>

                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-medium">{job.routeType}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{job.description}</p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Pay</p>
                      <p className="text-xs font-bold text-emerald-700 truncate">{job.payDescription}</p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Equipment</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{job.equipmentType}</p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Required CDL</p>
                      <p className="text-xs font-bold text-blue-700">{job.cdlClassRequired}</p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Min Experience</p>
                      <p className="text-xs font-bold text-slate-800">{job.minExperienceYears}+ Years</p>
                    </div>
                  </div>

                  {/* Match Factors / Reasons */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-700 mb-1">Match Analysis:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {reasons.map((reason, rIdx) => (
                        <span
                          key={rIdx}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  {job.benefits && job.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.benefits.slice(0, 3).map((benefit, bIdx) => (
                        <span
                          key={bIdx}
                          className="text-[10px] font-medium bg-emerald-50/80 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-md"
                        >
                          ✓ {benefit}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Action Box */}
                <div className="flex md:flex-col items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right hidden md:block">
                    <p className="text-base font-extrabold text-emerald-600">
                      ~${job.avgWeeklyPay?.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Avg Weekly Gross</p>
                  </div>

                  {applied ? (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>Applied</span>
                    </div>
                  ) : (
                    <button
                      id={`apply-btn-${job.id}`}
                      onClick={() => handleOpenApplyModal(job)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Express Interest / Apply</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Apply Modal */}
      {selectedJobForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Apply to {selectedJobForApply.companyName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Position: <strong className="text-slate-800">{selectedJobForApply.title}</strong>
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Verified Candidate Credentials Included:
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p>
                    • <strong>{driver.fullName}</strong> ({driver.cdlClass} • {driver.experienceYears} Years Exp)
                  </p>
                  <p>• Endorsements: {driver.endorsements?.join(', ') || 'Standard CDL'}</p>
                  <p>• Location: {driver.city}, {driver.state}</p>
                  <p>• Phone: {driver.phone}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Introduction Note to Recruiter:
                </label>
                <textarea
                  rows={4}
                  value={applyNote}
                  onChange={(e) => setApplyNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  placeholder="Share details about your availability, equipment experience, and why you're interested..."
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedJobForApply(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApply}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Application</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
