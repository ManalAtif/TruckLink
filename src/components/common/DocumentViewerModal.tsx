import React, { useState } from 'react';
import { DriverDocument } from '../../types';
import { X, FileText, CheckCircle2, AlertCircle, ShieldCheck, Download, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';

interface DocumentViewerModalProps {
  document: DriverDocument | null;
  driverName?: string;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  driverName,
  onClose,
}) => {
  const [zoom, setZoom] = useState<number>(1);

  if (!document) return null;

  const getDocTypeTitle = (type: string) => {
    switch (type) {
      case 'cdl_front':
        return 'Commercial Driver License (CDL)';
      case 'cdl_back':
        return 'CDL License (Back Side / Restrictions)';
      case 'dot_medical':
        return 'DOT Medical Examiner Certificate (Form MCSA-5876)';
      case 'mvr':
        return 'Official 3-Year MVR Driving Record Abstract';
      case 'twic':
        return 'TWIC (Transportation Worker Identification Credential)';
      default:
        return 'Credential Document';
    }
  };

  return (
    <div
      id="document-viewer-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="document-viewer-modal"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100/80 text-blue-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{document.name}</h3>
              <p className="text-xs text-slate-500">
                {driverName ? `Belongs to ${driverName} • ` : ''}
                {getDocTypeTitle(document.type)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="doc-zoom-out"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 font-mono">{Math.round(zoom * 100)}%</span>
            <button
              id="doc-zoom-in"
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <button
              id="close-doc-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {document.verified ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Admin Verified & Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Pending Verification
              </span>
            )}
            {document.expirationDate && (
              <span className="text-slate-600">
                Expires: <strong className="text-slate-900">{document.expirationDate}</strong>
              </span>
            )}
          </div>
          <span className="text-slate-500">
            Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
          </span>
        </div>

        {/* Document Content View */}
        <div className="flex-1 overflow-auto p-6 bg-slate-950/5 flex items-center justify-center min-h-[380px]">
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="transition-transform duration-150 rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white max-w-full"
          >
            <img
              src={document.url}
              alt={document.name}
              referrerPolicy="no-referrer"
              className="w-full max-h-[500px] object-contain block select-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Encrypted & stored in secure compliance cloud storage
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
