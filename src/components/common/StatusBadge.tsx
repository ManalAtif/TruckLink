import React from 'react';
import { DriverProfileStatus, ApplicationStatus } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, UserCheck, PhoneCall, Calendar, Award } from 'lucide-react';

interface StatusBadgeProps {
  status: DriverProfileStatus | ApplicationStatus | 'active' | 'suspended' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  switch (status) {
    case 'approved':
    case 'active':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses[size]}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          <span className="capitalize">{status === 'approved' ? 'Verified / Approved' : 'Active'}</span>
        </span>
      );

    case 'pending':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses[size]}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
          <span>Pending Review</span>
        </span>
      );

    case 'changes_requested':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/80 ${sizeClasses[size]}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />}
          <span>Changes Requested</span>
        </span>
      );

    case 'rejected':
    case 'suspended':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses[size]}`}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
          <span className="capitalize">{status}</span>
        </span>
      );

    case 'applied':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses[size]}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-blue-600" />}
          <span>Applied</span>
        </span>
      );

    case 'shortlisted':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${sizeClasses[size]}`}
        >
          {showIcon && <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
          <span>Shortlisted</span>
        </span>
      );

    case 'contacted':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 ${sizeClasses[size]}`}
        >
          {showIcon && <PhoneCall className="w-3.5 h-3.5 text-purple-600" />}
          <span>Contacted</span>
        </span>
      );

    case 'interviewing':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80 ${sizeClasses[size]}`}
        >
          {showIcon && <Calendar className="w-3.5 h-3.5 text-teal-600" />}
          <span>Interviewing</span>
        </span>
      );

    case 'offered':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200/80 ${sizeClasses[size]}`}
        >
          {showIcon && <Award className="w-3.5 h-3.5 text-cyan-600" />}
          <span>Offer Extended</span>
        </span>
      );

    case 'hired':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white shadow-sm ${sizeClasses[size]}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          <span>Hired!</span>
        </span>
      );

    default:
      return (
        <span
          id="badge-status-generic"
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses[size]}`}
        >
          {status}
        </span>
      );
  }
};
