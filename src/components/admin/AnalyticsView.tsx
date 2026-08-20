import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Award,
  Zap,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { drivers, recruiters, jobs, applications, analytics } = useAuth();

  const approvalRate =
    drivers.length > 0 ? Math.round((analytics.approvedDrivers / drivers.length) * 100) : 0;

  return (
    <div id="platform-analytics-view" className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Drivers Registered</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{analytics.totalDrivers}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-700 font-bold">{analytics.approvedDrivers} Approved</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 font-bold">{analytics.pendingDrivers} Pending</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Moderation Approval Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{approvalRate}%</p>
          <p className="text-xs text-slate-500">
            {analytics.rejectedDrivers} rejected • Compliant vetting
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Moderation Turnaround</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-purple-700">
            {analytics.avgModerationTurnaroundMinutes}m
          </p>
          <p className="text-xs text-slate-500">Average review queue latency</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Matches & Hires Made</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{analytics.hiresMade}</p>
          <p className="text-xs text-slate-500">
            {analytics.totalApplications} carrier match applications
          </p>
        </div>
      </div>

      {/* Driver Status Breakdown & Recruiter Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Moderation Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <span>Driver Compliance & Vetting Status</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-emerald-800">Approved & Verified Drivers</span>
                <span>{analytics.approvedDrivers} ({approvalRate}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${approvalRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-amber-800">Pending Review Queue</span>
                <span>
                  {analytics.pendingDrivers} (
                  {drivers.length ? Math.round((analytics.pendingDrivers / drivers.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{
                    width: `${
                      drivers.length ? (analytics.pendingDrivers / drivers.length) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-rose-800">Rejected / Non-Compliant</span>
                <span>
                  {analytics.rejectedDrivers} (
                  {drivers.length ? Math.round((analytics.rejectedDrivers / drivers.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all"
                  style={{
                    width: `${
                      drivers.length ? (analytics.rejectedDrivers / drivers.length) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Carrier Recruiter Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>Carrier Hiring Volume</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Registered Carriers</span>
              <p className="text-xl font-black text-slate-900 mt-1">{recruiters.length}</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">100% USDOT Verified</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Active Driving Positions</span>
              <p className="text-xl font-black text-slate-900 mt-1">{analytics.activeJobs}</p>
              <p className="text-[11px] text-blue-700 font-semibold mt-1">OTR, Regional & Local</p>
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-purple-700 shrink-0" />
            <span>
              Real-time Firestore synchronization active. Driver moderation decisions reflect across all carrier match queries in sub-second latency.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
