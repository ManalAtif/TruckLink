import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DriverProfile, DriverProfileStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { DriverReviewModal } from './DriverReviewModal';
import { MasterDataManager } from './MasterDataManager';
import { AnalyticsView } from './AnalyticsView';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Users,
  Database,
  BarChart3,
  Search,
  Eye,
  FileText,
  Truck,
  History,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    drivers,
    recruiters,
    jobs,
    analytics,
    toggleRecruiterStatus,
    showToast,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'queue' | 'all_drivers' | 'recruiters' | 'analytics' | 'master_data'
  >('queue');
  const [driverFilter, setDriverFilter] = useState<DriverProfileStatus | 'all'>('all');
  const [driverSearch, setDriverSearch] = useState<string>('');
  const [selectedDriverForReview, setSelectedDriverForReview] = useState<DriverProfile | null>(null);

  // Moderation Queue includes 'pending' and 'changes_requested'
  const pendingQueue = drivers.filter(
    (d) => d.status === 'pending' || d.status === 'changes_requested'
  );

  const filteredDrivers = drivers.filter((d) => {
    if (driverFilter !== 'all' && d.status !== driverFilter) return false;
    if (
      driverSearch &&
      !d.fullName.toLowerCase().includes(driverSearch.toLowerCase()) &&
      !d.cdlNumber.toLowerCase().includes(driverSearch.toLowerCase()) &&
      !d.city.toLowerCase().includes(driverSearch.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div id="admin-portal-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/30 p-2 flex items-center justify-center shrink-0 backdrop-blur-xs">
              <ShieldCheck className="w-9 h-9 text-purple-400" />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight font-display">
                  Platform Moderation & Trust Center
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                  Admin Authority Active
                </span>
              </div>

              <p className="text-xs text-purple-200 mt-1">
                Zeppelin Labs P3 Compliance Team • Vetting commercial CDL credentials before carrier release
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center shrink-0">
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs">
              <p className="text-xl font-black text-amber-400">{pendingQueue.length}</p>
              <p className="text-[10px] text-slate-300 uppercase font-semibold">In Review Queue</p>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs">
              <p className="text-xl font-black text-emerald-400">{analytics.approvedDrivers}</p>
              <p className="text-[10px] text-slate-300 uppercase font-semibold">Approved Drivers</p>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs">
              <p className="text-xl font-black text-white">{recruiters.length}</p>
              <p className="text-[10px] text-slate-300 uppercase font-semibold">Carriers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto">
        <div className="flex items-center gap-2 -mb-px">
          <button
            id="admin-tab-queue"
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'queue'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Moderation Queue</span>
            {pendingQueue.length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-900 font-extrabold animate-pulse">
                {pendingQueue.length}
              </span>
            )}
          </button>

          <button
            id="admin-tab-all-drivers"
            onClick={() => setActiveTab('all_drivers')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all_drivers'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Driver Profiles ({drivers.length})</span>
          </button>

          <button
            id="admin-tab-recruiters"
            onClick={() => setActiveTab('recruiters')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'recruiters'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Carrier Accounts ({recruiters.length})</span>
          </button>

          <button
            id="admin-tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Platform Analytics</span>
          </button>

          <button
            id="admin-tab-master-data"
            onClick={() => setActiveTab('master_data')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'master_data'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Master Data Config</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Moderation Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pending Driver Submissions & Verification Queue ({pendingQueue.length})
              </h3>
              <p className="text-xs text-slate-500">
                Inspect submitted driver licenses, medical cards, and endorsements. Approving will immediately unlock recruiter matching.
              </p>
            </div>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">Queue is Clear!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All submitted commercial driver profiles have been reviewed and verified.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingQueue.map((driver) => (
                <div
                  key={driver.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-purple-300 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-base shrink-0">
                        {driver.fullName.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-base font-bold text-slate-900">{driver.fullName}</h4>
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
                            {driver.cdlClass}
                          </span>
                          <StatusBadge status={driver.status} size="sm" />
                        </div>

                        <p className="text-xs text-slate-600">
                          {driver.city}, {driver.state} • {driver.experienceYears} Years Exp • CDL #{' '}
                          <span className="font-mono">{driver.cdlNumber}</span>
                        </p>

                        <p className="text-xs text-slate-500 line-clamp-2">{driver.bio}</p>
                      </div>
                    </div>

                    <button
                      id={`btn-review-driver-${driver.id}`}
                      onClick={() => setSelectedDriverForReview(driver)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Review & Moderate Profile</span>
                    </button>
                  </div>

                  {/* Documents count and endorsements row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700">Claimed Endorsements:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {driver.endorsements?.length ? (
                          driver.endorsements.map((e, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded font-semibold text-[10px]"
                            >
                              ✓ {e}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-700">Uploaded Compliance Documents:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-slate-800">
                          {driver.documents?.length || 0} Files Attached
                        </span>
                        {driver.documents?.map((d) => (
                          <span
                            key={d.id}
                            className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600"
                          >
                            {d.name.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Drivers Directory */}
      {activeTab === 'all_drivers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Commercial Drivers Directory</h3>
              <p className="text-xs text-slate-500">
                Master record of all registered drivers across all status states
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  placeholder="Search driver name or CDL..."
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              {/* Status Filter */}
              <select
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="all">All Statuses ({drivers.length})</option>
                <option value="approved">Approved / Verified</option>
                <option value="pending">Pending Review</option>
                <option value="changes_requested">Changes Requested</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">Driver</th>
                  <th className="p-3">CDL & State</th>
                  <th className="p-3">Endorsements</th>
                  <th className="p-3">Experience</th>
                  <th className="p-3">Documents</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{driver.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        {driver.city}, {driver.state}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-blue-700">{driver.cdlClass}</div>
                      <div className="font-mono text-[11px] text-slate-500">{driver.cdlNumber}</div>
                    </td>

                    <td className="p-3">
                      <div className="max-w-[180px] truncate text-[11px] text-slate-700 font-medium">
                        {driver.endorsements?.join(', ') || 'None'}
                      </div>
                    </td>

                    <td className="p-3 font-semibold text-slate-800">
                      {driver.experienceYears} Years
                    </td>

                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                        {driver.documents?.length || 0} files
                      </span>
                    </td>

                    <td className="p-3">
                      <StatusBadge status={driver.status} size="sm" />
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedDriverForReview(driver)}
                        className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-bold transition-colors"
                      >
                        Moderate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Carrier Management */}
      {activeTab === 'recruiters' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Carrier Accounts & Fleet Verification</h3>
              <p className="text-xs text-slate-500">
                Manage commercial carrier recruiter access, USDOT verification, and active job postings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recruiters.map((rec) => {
              const recJobs = jobs.filter((j) => j.recruiterId === rec.id);
              return (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{rec.companyName}</h4>
                      <p className="text-xs text-slate-500">
                        {rec.dotNumber} • {rec.mcNumber} • {rec.headquarters}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        rec.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{rec.companyBio}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700">
                      Contact: {rec.contactName} ({rec.contactPhone})
                    </span>

                    <button
                      onClick={() =>
                        toggleRecruiterStatus(
                          rec.id,
                          rec.status === 'active' ? 'suspended' : 'active'
                        )
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        rec.status === 'active'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {rec.status === 'active' ? 'Suspend Account' : 'Reactivate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Analytics */}
      {activeTab === 'analytics' && <AnalyticsView />}

      {/* Tab 5: Master Data */}
      {activeTab === 'master_data' && <MasterDataManager />}

      {/* Review Modal */}
      {selectedDriverForReview && (
        <DriverReviewModal
          driver={selectedDriverForReview}
          onClose={() => setSelectedDriverForReview(null)}
        />
      )}
    </div>
  );
};
