import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Truck, Building2, Shield, RefreshCw, Sparkles, User, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { UserRole } from '../../types';

export const DemoRoleBar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeDriverId,
    setActiveDriverId,
    drivers,
    activeRecruiterId,
    setActiveRecruiterId,
    recruiters,
    resetToDemoData,
  } = useAuth();

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
  };

  return (
    <aside
      id="demo-role-quick-bar"
      aria-label="Evaluation mode and demo role switcher"
      className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs py-2 px-4 shadow-inner"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role Switchers */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px] mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Evaluation Mode:
          </span>

          {/* Role Tabs */}
          <div className="inline-flex rounded-lg bg-slate-800/90 p-0.5 border border-slate-700">
            <button
              id="role-btn-driver"
              onClick={() => handleRoleChange('driver')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                currentRole === 'driver'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Driver Portal</span>
            </button>

            <button
              id="role-btn-recruiter"
              onClick={() => handleRoleChange('recruiter')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                currentRole === 'recruiter'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Recruiter Portal</span>
            </button>

            <button
              id="role-btn-admin"
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                currentRole === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Admin</span>
            </button>
          </div>
        </div>

        {/* Center: Contextual Persona Selector for testing different states */}
        <div className="flex items-center gap-3">
          {currentRole === 'driver' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] hidden sm:inline">Active Driver:</span>
              <select
                id="active-driver-select"
                value={activeDriverId}
                onChange={(e) => setActiveDriverId(e.target.value)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded-md px-2 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.cdlClass} • {d.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentRole === 'recruiter' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] hidden sm:inline">Active Carrier:</span>
              <select
                id="active-recruiter-select"
                value={activeRecruiterId}
                onChange={(e) => setActiveRecruiterId(e.target.value)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded-md px-2 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
              >
                {recruiters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.companyName} ({r.contactName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentRole === 'admin' && (
            <div className="flex items-center gap-1.5 text-purple-300 text-[11px] bg-purple-950/60 px-2 py-1 rounded border border-purple-800/70">
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Full Moderation & Audit Privileges</span>
            </div>
          )}

          {/* Reset Demo Data button */}
          <button
            id="reset-demo-data-btn"
            onClick={resetToDemoData}
            title="Reset database to initial clean demo records"
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
