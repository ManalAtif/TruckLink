import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JobPosting } from '../../types';
import { DriverMatchingView } from './DriverMatchingView';
import { CandidatePipelineView } from './CandidatePipelineView';
import { JobPostModal } from './JobPostModal';
import {
  Building2,
  Sparkles,
  Briefcase,
  Users,
  Plus,
  Edit2,
  CheckCircle2,
  Truck,
  ShieldCheck,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const {
    currentRecruiter,
    jobs,
    activeRecruiterId,
    applications,
    updateJobPosting,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'matching' | 'jobs' | 'pipeline'>('matching');
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [jobToEdit, setJobToEdit] = useState<JobPosting | null>(null);

  if (!currentRecruiter) {
    return (
      <div className="p-12 text-center text-slate-500">
        No active carrier profile selected. Please choose a carrier from the top toolbar.
      </div>
    );
  }

  const myJobs = jobs.filter((j) => j.recruiterId === activeRecruiterId);
  const myApplications = applications.filter((a) => a.recruiterId === activeRecruiterId);
  const hiresCount = myApplications.filter((a) => a.status === 'hired').length;

  const handleOpenCreateJob = () => {
    setJobToEdit(null);
    setShowJobModal(true);
  };

  const handleOpenEditJob = (job: JobPosting) => {
    setJobToEdit(job);
    setShowJobModal(true);
  };

  const handleToggleJobStatus = async (job: JobPosting) => {
    const nextStatus = job.status === 'active' ? 'paused' : 'active';
    await updateJobPosting(job.id, { status: nextStatus });
  };

  return (
    <div id="recruiter-portal-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Carrier Company Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 p-2 flex items-center justify-center shrink-0 backdrop-blur-xs">
              <Building2 className="w-9 h-9 text-emerald-400" />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight font-display">
                  {currentRecruiter.companyName}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Carrier (USDOT Active)
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1 flex items-center gap-3 flex-wrap">
                <span>{currentRecruiter.dotNumber}</span>
                <span>•</span>
                <span>{currentRecruiter.mcNumber}</span>
                <span>•</span>
                <span>{currentRecruiter.fleetSize}</span>
                <span>•</span>
                <span>HQ: {currentRecruiter.headquarters}</span>
              </p>

              <p className="text-xs text-slate-400 mt-2 max-w-2xl">{currentRecruiter.companyBio}</p>
            </div>
          </div>

          {/* Quick Metrics & Post Job CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
                <p className="text-base font-bold text-white">{myJobs.length}</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Jobs</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
                <p className="text-base font-bold text-white">{myApplications.length}</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Candidates</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
                <p className="text-base font-bold text-emerald-400">{hiresCount}</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Hired</p>
              </div>
            </div>

            <button
              id="btn-post-new-job"
              onClick={handleOpenCreateJob}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Job Position</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2 -mb-px">
          <button
            id="recruiter-tab-matching"
            onClick={() => setActiveTab('matching')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'matching'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Driver Match Engine</span>
          </button>

          <button
            id="recruiter-tab-jobs"
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'jobs'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Job Openings ({myJobs.length})</span>
          </button>

          <button
            id="recruiter-tab-pipeline"
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'pipeline'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Candidate Hiring Pipeline</span>
            {myApplications.length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {myApplications.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'matching' && <DriverMatchingView />}

      {activeTab === 'pipeline' && <CandidatePipelineView />}

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Active Carrier Driving Positions ({myJobs.length})
            </h3>
            <button
              onClick={handleOpenCreateJob}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post New Position</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {myJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-lg font-bold text-slate-900">{job.title}</h4>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          job.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job.routeType} • {job.equipmentType} • Required {job.cdlClassRequired} ({job.minExperienceYears}+ yrs exp)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditJob(job)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Requirements</span>
                    </button>

                    <button
                      onClick={() => handleToggleJobStatus(job)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border ${
                        job.status === 'active'
                          ? 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
                          : 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {job.status === 'active' ? 'Pause Position' : 'Reactivate'}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{job.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Pay Package</p>
                    <p className="font-bold text-emerald-700">{job.payDescription}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Endorsements</p>
                    <p className="font-semibold text-slate-800">
                      {job.endorsementsRequired?.length ? job.endorsementsRequired.join(', ') : 'None'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Operating Lanes</p>
                    <p className="font-semibold text-slate-800">{job.operatingRegions?.join(', ')}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Applications</p>
                    <p className="font-bold text-blue-700">
                      {applications.filter((a) => a.jobId === job.id).length} Candidates
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Job Modal */}
      {showJobModal && (
        <JobPostModal jobToEdit={jobToEdit} onClose={() => setShowJobModal(false)} />
      )}
    </div>
  );
};
