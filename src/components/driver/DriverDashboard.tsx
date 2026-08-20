import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DriverStatusBanner } from './DriverStatusBanner';
import { DriverProfileForm } from './DriverProfileForm';
import { DriverOpportunities } from './DriverOpportunities';
import { DriverApplicationsView } from './DriverApplicationsView';
import { User, Sparkles, Briefcase, Award, ShieldCheck } from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const { currentDriver, applications, jobs } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'opportunities' | 'applications'>('profile');

  if (!currentDriver) {
    return (
      <div className="p-12 text-center text-slate-500">
        No active driver selected. Please choose a driver from the evaluation toolbar above.
      </div>
    );
  }

  const myAppsCount = applications.filter((a) => a.driverId === currentDriver.id).length;

  return (
    <div id="driver-portal-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Driver Status Lifecycle Banner */}
      <DriverStatusBanner
        driver={currentDriver}
        onOpenProfileTab={() => setActiveTab('profile')}
        onOpenOpportunitiesTab={() => setActiveTab('opportunities')}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 mb-6">
        <div className="flex items-center gap-2 -mb-px">
          <button
            id="driver-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Driver Profile & CDL Credentials</span>
          </button>

          <button
            id="driver-tab-opportunities"
            onClick={() => setActiveTab('opportunities')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'opportunities'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Matching Opportunities</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
              {jobs.filter((j) => j.status === 'active').length}
            </span>
          </button>

          <button
            id="driver-tab-applications"
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'applications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>My Applications</span>
            {myAppsCount > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
                {myAppsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && <DriverProfileForm driver={currentDriver} />}
      {activeTab === 'opportunities' && <DriverOpportunities driver={currentDriver} />}
      {activeTab === 'applications' && <DriverApplicationsView driver={currentDriver} />}
    </div>
  );
};
