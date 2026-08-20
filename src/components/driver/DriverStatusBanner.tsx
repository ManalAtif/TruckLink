import React, { useState } from 'react';
import { DriverProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  History,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Send,
  FileCheck,
} from 'lucide-react';

interface DriverStatusBannerProps {
  driver: DriverProfile;
  onOpenProfileTab: () => void;
  onOpenOpportunitiesTab: () => void;
}

export const DriverStatusBanner: React.FC<DriverStatusBannerProps> = ({
  driver,
  onOpenProfileTab,
  onOpenOpportunitiesTab,
}) => {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const { submitDriverForReview } = useAuth();

  const getStepStatus = (stepIndex: number) => {
    // 0: Profile Submitted, 1: Moderation Review, 2: Verification/Approval, 3: Recruiter Matching
    if (driver.status === 'approved') return 'completed';
    if (driver.status === 'pending') {
      if (stepIndex <= 1) return stepIndex === 1 ? 'current' : 'completed';
      return 'upcoming';
    }
    if (driver.status === 'changes_requested') {
      if (stepIndex === 1) return 'action_required';
      if (stepIndex === 0) return 'completed';
      return 'upcoming';
    }
    if (driver.status === 'rejected') {
      if (stepIndex === 1) return 'rejected';
      if (stepIndex === 0) return 'completed';
      return 'upcoming';
    }
    return 'upcoming';
  };

  return (
    <div
      id="driver-status-banner-card"
      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6"
    >
      {/* Top Banner based on Status */}
      <div
        className={`p-6 border-b ${
          driver.status === 'approved'
            ? 'bg-gradient-to-r from-emerald-900/10 via-emerald-50 to-white border-emerald-200'
            : driver.status === 'pending'
            ? 'bg-gradient-to-r from-amber-900/10 via-amber-50 to-white border-amber-200'
            : driver.status === 'changes_requested'
            ? 'bg-gradient-to-r from-orange-900/10 via-orange-50 to-white border-orange-200'
            : 'bg-gradient-to-r from-rose-900/10 via-rose-50 to-white border-rose-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl shrink-0 shadow-xs ${
                driver.status === 'approved'
                  ? 'bg-emerald-600 text-white'
                  : driver.status === 'pending'
                  ? 'bg-amber-500 text-white'
                  : driver.status === 'changes_requested'
                  ? 'bg-orange-500 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {driver.status === 'approved' && <ShieldCheck className="w-7 h-7" />}
              {driver.status === 'pending' && <Clock className="w-7 h-7 animate-pulse" />}
              {driver.status === 'changes_requested' && <AlertTriangle className="w-7 h-7" />}
              {driver.status === 'rejected' && <XCircle className="w-7 h-7" />}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 font-display">
                  {driver.status === 'approved' && 'Profile Verified & Active in Recruiter Search'}
                  {driver.status === 'pending' && 'Profile Under Admin Moderation Review'}
                  {driver.status === 'changes_requested' && 'Action Required: Corrections Requested by Admin'}
                  {driver.status === 'rejected' && 'Application Not Approved'}
                </h2>
                <StatusBadge status={driver.status} size="md" />
              </div>

              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                {driver.status === 'approved' && (
                  <span>
                    Your CDL credentials, endorsements, and DOT medical documents are fully verified. Recruiter matches can view your verified profile and contact you directly.
                  </span>
                )}
                {driver.status === 'pending' && (
                  <span>
                    Your profile and uploaded license/DOT documents have been submitted to the platform admin queue. Average review time is under 45 minutes.
                  </span>
                )}
                {driver.status === 'changes_requested' && (
                  <span className="text-orange-950 font-medium">
                    The platform admin reviewed your submission and requested updates before approving your profile. See feedback below.
                  </span>
                )}
                {driver.status === 'rejected' && (
                  <span>
                    Your profile was not approved due to commercial carrier compliance standards. Review the admin notes below.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            {driver.status === 'approved' && (
              <button
                id="btn-view-matches-from-banner"
                onClick={onOpenOpportunitiesTab}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
              >
                <span>Browse Matching Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {driver.status === 'changes_requested' && (
              <button
                id="btn-fix-profile-from-banner"
                onClick={onOpenProfileTab}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-sm transition-all"
              >
                <span>Edit Profile & Re-upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {driver.status === 'pending' && (
              <div className="text-xs text-amber-800 bg-amber-100/80 px-3 py-2 rounded-xl border border-amber-200 flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                Moderation in progress
              </div>
            )}
          </div>
        </div>

        {/* Admin Feedback Callout Box if Changes Requested or Rejected */}
        {(driver.status === 'changes_requested' || driver.status === 'rejected' || driver.adminFeedback) && (
          <div
            id="driver-admin-feedback-box"
            className={`mt-4 p-4 rounded-xl text-sm border ${
              driver.status === 'changes_requested'
                ? 'bg-orange-50/90 border-orange-200 text-orange-900'
                : driver.status === 'rejected'
                ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="font-bold text-xs uppercase tracking-wider shrink-0 mt-0.5">
                Admin Note:
              </div>
              <div className="flex-1">
                <p className="font-medium">{driver.adminFeedback || 'All credentials checked.'}</p>
                {driver.moderatedBy && (
                  <p className="text-xs opacity-75 mt-1">
                    Reviewed by {driver.moderatedBy} on{' '}
                    {driver.moderatedAt ? new Date(driver.moderatedAt).toLocaleString() : 'recently'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Progression Steps */}
      <div className="p-6 bg-slate-50/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">1. Profile Submitted</p>
              <p className="text-[11px] text-slate-500">Credentials & docs uploaded</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                getStepStatus(1) === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : getStepStatus(1) === 'current'
                  ? 'bg-amber-500 text-white animate-pulse'
                  : getStepStatus(1) === 'action_required'
                  ? 'bg-orange-500 text-white'
                  : getStepStatus(1) === 'rejected'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {getStepStatus(1) === 'completed' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : getStepStatus(1) === 'action_required' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                '2'
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">2. Admin Moderation</p>
              <p className="text-[11px] text-slate-500">
                {driver.status === 'pending' ? 'Reviewing documents...' : 'CDL & MVR inspection'}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                driver.status === 'approved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {driver.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : '3'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">3. Verification Live</p>
              <p className="text-[11px] text-slate-500">
                {driver.status === 'approved' ? 'Verified Driver Badge' : 'Pending admin sign-off'}
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                driver.status === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">4. Recruiter Matching</p>
              <p className="text-[11px] text-slate-500">Apply & receive carrier offers</p>
            </div>
          </div>
        </div>

        {/* Status History Collapsible Toggle */}
        <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-between">
          <button
            id="toggle-status-history-btn"
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Status History & Audit Log ({driver.statusHistory?.length || 1} records)</span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {driver.status !== 'pending' && driver.status !== 'approved' && (
            <button
              id="resubmit-driver-btn"
              onClick={() => submitDriverForReview(driver.id)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Resubmit Profile for Review</span>
            </button>
          )}
        </div>

        {/* Status History Drawer */}
        {showHistory && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2.5">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Profile Status Transitions:
            </h4>
            <div className="space-y-2">
              {driver.statusHistory?.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={entry.status} size="sm" />
                      <span className="font-semibold text-slate-800">
                        {entry.adminName || 'System / Driver'}
                      </span>
                    </div>
                    {entry.note && <p className="text-slate-600 mt-1">{entry.note}</p>}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-4">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
