import React from 'react';
import { DriverProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  MessageSquare,
  PhoneCall,
  Award,
} from 'lucide-react';

interface DriverApplicationsViewProps {
  driver: DriverProfile;
}

export const DriverApplicationsView: React.FC<DriverApplicationsViewProps> = ({ driver }) => {
  const { applications } = useAuth();

  const myApplications = applications.filter((a) => a.driverId === driver.id);

  return (
    <div id="driver-applications-view" className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span>My Application Pipeline ({myApplications.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Track hiring status, recruiter interview requests, and job offers
          </p>
        </div>
      </div>

      {myApplications.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No active applications yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Browse the Matching Opportunities tab to express interest in high-paying dedicated and regional freight lanes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {myApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{app.jobTitle}</h3>
                    <StatusBadge status={app.status} size="md" />
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700">{app.companyName}</span>
                    <span>•</span>
                    <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {app.matchScore}% Match Fit
                  </span>
                </div>
              </div>

              {/* Driver note */}
              {app.driverNote && (
                <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">Your application note: </span>
                  <span className="text-slate-600">"{app.driverNote}"</span>
                </div>
              )}

              {/* Recruiter feedback / Interview Info */}
              {app.recruiterNotes && (
                <div className="text-xs bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-blue-900">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Recruiter Message / Updates:</span>
                  </div>
                  <p>{app.recruiterNotes}</p>
                  {app.interviewDate && (
                    <div className="mt-2 flex items-center gap-2 font-bold text-blue-950">
                      <Calendar className="w-4 h-4 text-blue-700" />
                      <span>Interview Scheduled: {new Date(app.interviewDate).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Milestones */}
              <div className="pt-2">
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                  <div className={`p-1.5 rounded-lg ${app.status !== 'rejected' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                    1. Applied
                  </div>
                  <div className={`p-1.5 rounded-lg ${['shortlisted', 'contacted', 'interviewing', 'offered', 'hired'].includes(app.status) ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-400'}`}>
                    2. Shortlisted
                  </div>
                  <div className={`p-1.5 rounded-lg ${['contacted', 'interviewing', 'offered', 'hired'].includes(app.status) ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-400'}`}>
                    3. Contacted
                  </div>
                  <div className={`p-1.5 rounded-lg ${['interviewing', 'offered', 'hired'].includes(app.status) ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-400'}`}>
                    4. Interview
                  </div>
                  <div className={`p-1.5 rounded-lg ${['offered', 'hired'].includes(app.status) ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'}`}>
                    5. {app.status === 'hired' ? 'Hired!' : 'Offer'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
