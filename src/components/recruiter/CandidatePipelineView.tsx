import React, { useState } from 'react';
import { JobApplication, ApplicationStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users,
  CheckCircle2,
  PhoneCall,
  Calendar,
  Award,
  ChevronRight,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const CandidatePipelineView: React.FC = () => {
  const { applications, activeRecruiterId, updateApplicationStatus, showToast } = useAuth();

  const recruiterApps = applications.filter((a) => a.recruiterId === activeRecruiterId);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [stageNotes, setStageNotes] = useState('');
  const [interviewTime, setInterviewTime] = useState('');

  const stages: { id: ApplicationStatus; title: string; color: string; badgeClass: string }[] = [
    { id: 'applied', title: '1. Applied', color: 'border-blue-500', badgeClass: 'bg-blue-50 text-blue-700' },
    { id: 'shortlisted', title: '2. Shortlisted', color: 'border-indigo-500', badgeClass: 'bg-indigo-50 text-indigo-700' },
    { id: 'contacted', title: '3. Contacted', color: 'border-purple-500', badgeClass: 'bg-purple-50 text-purple-700' },
    { id: 'interviewing', title: '4. Interviewing', color: 'border-teal-500', badgeClass: 'bg-teal-50 text-teal-700' },
    { id: 'offered', title: '5. Offer Sent', color: 'border-cyan-500', badgeClass: 'bg-cyan-50 text-cyan-700' },
    { id: 'hired', title: '6. Hired!', color: 'border-emerald-500', badgeClass: 'bg-emerald-600 text-white' },
  ];

  const handleAdvanceStage = async (app: JobApplication, nextStage: ApplicationStatus) => {
    await updateApplicationStatus(app.id, nextStage);
  };

  const handleUpdateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    await updateApplicationStatus(
      selectedApp.id,
      selectedApp.status,
      stageNotes,
      interviewTime || selectedApp.interviewDate
    );
    setSelectedApp(null);
  };

  return (
    <div id="candidate-pipeline-kanban" className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Driver Candidate Pipeline ({recruiterApps.length} Candidates)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Track candidates through recruitment stages from application to hiring
          </p>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const appsInStage = recruiterApps.filter((a) => a.status === stage.id);
          const nextStageIndex = stages.findIndex((s) => s.id === stage.id) + 1;
          const nextStage = stages[nextStageIndex]?.id;

          return (
            <div
              key={stage.id}
              className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3 min-w-[210px] flex flex-col min-h-[450px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">{stage.title}</span>
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${stage.badgeClass}`}
                >
                  {appsInStage.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="space-y-2.5 flex-1">
                {appsInStage.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-slate-900 leading-tight">{app.driverName}</h4>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                        {app.matchScore}%
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate">{app.jobTitle}</p>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <span className="bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded">
                        {app.driverCdlClass}
                      </span>
                      <span>•</span>
                      <span>{app.driverExperience} yrs exp</span>
                    </div>

                    {app.recruiterNotes && (
                      <p className="text-[10px] bg-slate-50 p-1.5 rounded text-slate-600 line-clamp-2 border border-slate-100">
                        💬 {app.recruiterNotes}
                      </p>
                    )}

                    {/* Quick Move Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setStageNotes(app.recruiterNotes || '');
                          setInterviewTime(app.interviewDate || '');
                        }}
                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Add Note / Date
                      </button>

                      {nextStage && (
                        <button
                          onClick={() => handleAdvanceStage(app, nextStage)}
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
                          title={`Advance to ${stages[nextStageIndex]?.title}`}
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {appsInStage.length === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs italic">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Notes & Interview Schedule Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Update Candidate: {selectedApp.driverName}
              </h3>
              <p className="text-xs text-slate-500">Position: {selectedApp.jobTitle}</p>
            </div>

            <form onSubmit={handleUpdateNotes} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Recruiter Notes / Status Log:</label>
                <textarea
                  rows={3}
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Notes from phone screen, salary agreement, or hiring terms..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Schedule Interview Date / Time:</label>
                <input
                  type="datetime-local"
                  value={interviewTime ? interviewTime.slice(0, 16) : ''}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Save Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
