import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Truck, ShieldCheck, Building2, User, Database, Bell, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const Header: React.FC = () => {
  const { currentRole, currentDriver, currentRecruiter, analytics } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 font-display">
                  Truck<span className="text-blue-600">Link</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  P3 Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Commercial Driver Hiring & Onboarding Platform
              </p>
            </div>
          </div>

          {/* Center Info / Role indicator */}
          <div className="hidden lg:flex items-center gap-3">
            {currentRole === 'driver' && currentDriver && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                  {currentDriver.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {currentDriver.fullName}
                    <span className="text-slate-400">•</span>
                    <span className="text-blue-600 font-semibold">{currentDriver.cdlClass}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>Status:</span>
                    <StatusBadge status={currentDriver.status} size="sm" showIcon={false} />
                  </div>
                </div>
              </div>
            )}

            {currentRole === 'recruiter' && currentRecruiter && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800">{currentRecruiter.companyName}</div>
                  <div className="text-[11px] text-emerald-700 font-medium">
                    {currentRecruiter.dotNumber} • {currentRecruiter.contactName}
                  </div>
                </div>
              </div>
            )}

            {currentRole === 'admin' && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800">Admin Control Center</div>
                  <div className="text-[11px] text-purple-700 font-medium">
                    {analytics.pendingDrivers} Pending in Moderation Queue
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Status Indicator & Firestore Live Connection */}
          <div className="flex items-center gap-3">
            <div
              id="firestore-status-badge"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs border border-slate-200"
              title="Connected to Firebase Firestore & Node.js backend"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-mono text-[11px] hidden sm:inline">Firestore Live</span>
            </div>

            {/* Role indicator pill */}
            <div
              id="current-role-indicator"
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                currentRole === 'driver'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : currentRole === 'recruiter'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-purple-100 text-purple-800 border border-purple-200'
              }`}
            >
              {currentRole}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
