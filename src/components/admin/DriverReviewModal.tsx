import React, { useState } from 'react';
import { DriverProfile, DriverDocument } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { DocumentViewerModal } from '../common/DocumentViewerModal';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  User,
  Truck,
  Eye,
  Calendar,
  AlertCircle,
  Clock,
  Send,
} from 'lucide-react';

interface DriverReviewModalProps {
  driver: DriverProfile;
  onClose: () => void;
}

export const DriverReviewModal: React.FC<DriverReviewModalProps> = ({ driver, onClose }) => {
  const { approveDriver, rejectDriver, requestDriverChanges, showToast } = useAuth();

  const [activeDecision, setActiveDecision] = useState<'approve' | 'changes' | 'reject'>('approve');
  const [adminComment, setAdminComment] = useState<string>(
    'CDL Class and DOT Medical examination certificate verified. Clean MVR abstract validated against FMCSA Clearinghouse.'
  );
  const [changesNote, setChangesNote] = useState<string>(
    'Please re-upload a clear high-resolution scan of your DOT Medical Certificate. The National Registry Number and expiration date must be legible.'
  );
  const [rejectReason, setRejectReason] = useState<string>(
    'Commercial driving abstract does not satisfy carrier underwriting insurance criteria.'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<DriverDocument | null>(null);

  const handleExecuteDecision = async () => {
    setIsProcessing(true);
    if (activeDecision === 'approve') {
      await approveDriver(driver.id, adminComment);
    } else if (activeDecision === 'changes') {
      if (!changesNote.trim()) {
        showToast('Please provide a specific change request note for the driver', 'warning');
        setIsProcessing(false);
        return;
      }
      await requestDriverChanges(driver.id, changesNote);
    } else if (activeDecision === 'reject') {
      if (!rejectReason.trim()) {
        showToast('Please provide a reason for rejection', 'warning');
        setIsProcessing(false);
        return;
      }
      await rejectDriver(driver.id, rejectReason);
    }
    setIsProcessing(false);
    onClose();
  };

  return (
    <div
      id="driver-moderation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
    >
      <div
        id="driver-moderation-modal"
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Moderation Review: {driver.fullName}
                </h3>
                <StatusBadge status={driver.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500">
                Submitted on {new Date(driver.createdAt).toLocaleDateString()} • License: {driver.cdlClass} ({driver.cdlState})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Driver Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">CDL Number</span>
              <p className="font-mono font-bold text-blue-700 text-sm mt-0.5">{driver.cdlNumber}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">License Class</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{driver.cdlClass}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Experience</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{driver.experienceYears} Years Verified</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">License Expiration</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{driver.cdlExpirationDate || 'On Record'}</p>
            </div>
          </div>

          {/* Endorsements & Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Claimed Endorsements:</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {driver.endorsements?.length ? (
                  driver.endorsements.map((e, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-900 border border-indigo-200 font-semibold rounded-lg"
                    >
                      ✓ {e}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">Standard CDL with No Endorsements</span>
                )}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Equipment & Routes:</span>
              </h4>
              <p className="text-slate-600">
                <strong>Equipment:</strong> {driver.equipmentTypes?.join(', ') || 'Dry Van'}
              </p>
              <p className="text-slate-600">
                <strong>Routes:</strong> {driver.preferredRoutes?.join(', ') || 'All Routes'}
              </p>
            </div>
          </div>

          {/* Document Verification Inspector */}
          <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-purple-950 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-purple-700" />
                <span>Submitted Compliance Documents ({driver.documents?.length || 0})</span>
              </h4>
              <span className="text-[11px] text-purple-800 font-medium">
                Click "Inspect Document" to verify expiration & seal
              </span>
            </div>

            {driver.documents && driver.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {driver.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-white border border-purple-100 flex items-center justify-between shadow-xs"
                  >
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-900 truncate">{doc.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {doc.expirationDate ? `Expires: ${doc.expirationDate}` : 'Uploaded scan'}
                      </p>
                    </div>

                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-200 flex items-center gap-1 shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center bg-white rounded-xl text-amber-800 text-xs">
                ⚠️ No documents uploaded by driver. Consider requesting documents before approval.
              </div>
            )}
          </div>

          {/* Moderation Decision Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">Select Moderation Action:</h4>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setActiveDecision('approve')}
                className={`p-3.5 rounded-2xl border text-left font-bold transition-all ${
                  activeDecision === 'approve'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Approve Profile</span>
                </div>
                <p className="text-[11px] font-normal text-slate-500">
                  Verify credentials and make profile live for carrier matching
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveDecision('changes')}
                className={`p-3.5 rounded-2xl border text-left font-bold transition-all ${
                  activeDecision === 'changes'
                    ? 'bg-orange-50 border-orange-500 text-orange-900 ring-2 ring-orange-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span>Request Changes</span>
                </div>
                <p className="text-[11px] font-normal text-slate-500">
                  Notify driver to fix or re-upload specific documents
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveDecision('reject')}
                className={`p-3.5 rounded-2xl border text-left font-bold transition-all ${
                  activeDecision === 'reject'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Reject Profile</span>
                </div>
                <p className="text-[11px] font-normal text-slate-500">
                  Reject due to expired credentials or safety record issues
                </p>
              </button>
            </div>

            {/* Decision Notes Input */}
            <div className="pt-2">
              {activeDecision === 'approve' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Approval Verification Note (Recorded in Audit Log):
                  </label>
                  <textarea
                    rows={2}
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              )}

              {activeDecision === 'changes' && (
                <div>
                  <label className="block font-bold text-orange-900 mb-1">
                    Required Corrections for Driver (Will be displayed prominently on driver portal):
                  </label>
                  <textarea
                    rows={3}
                    value={changesNote}
                    onChange={(e) => setChangesNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-orange-300 bg-orange-50/40 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              )}

              {activeDecision === 'reject' && (
                <div>
                  <label className="block font-bold text-rose-900 mb-1">
                    Reason for Profile Rejection:
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-rose-300 bg-rose-50/40 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Admin: <strong>Marcus Vance (Zeppelin Labs Moderation Team)</strong>
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExecuteDecision}
              disabled={isProcessing}
              className={`px-6 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 ${
                activeDecision === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : activeDecision === 'changes'
                  ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {activeDecision === 'approve' && 'Confirm & Approve Driver'}
                {activeDecision === 'changes' && 'Send Change Request'}
                {activeDecision === 'reject' && 'Confirm Rejection'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Document Viewer if opened from inspector */}
      {previewDoc && (
        <DocumentViewerModal
          document={previewDoc}
          driverName={driver.fullName}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
