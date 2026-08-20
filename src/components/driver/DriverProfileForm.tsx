import React, { useState } from 'react';
import { DriverProfile, CDLClass, DriverDocument } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Shield,
  Truck,
  Award,
  Calendar,
  DollarSign,
  Upload,
  FileText,
  CheckCircle2,
  Trash2,
  Eye,
  Plus,
  Save,
  Send,
  AlertCircle,
} from 'lucide-react';
import { DocumentViewerModal } from '../common/DocumentViewerModal';

interface DriverProfileFormProps {
  driver: DriverProfile;
}

export const DriverProfileForm: React.FC<DriverProfileFormProps> = ({ driver }) => {
  const { updateDriverProfile, submitDriverForReview, masterData, showToast } = useAuth();

  const [formData, setFormData] = useState<DriverProfile>({ ...driver });
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DriverDocument | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync if prop changes
  React.useEffect(() => {
    setFormData({ ...driver });
  }, [driver]);

  const handleChange = (field: keyof DriverProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleArrayItem = (field: 'endorsements' | 'equipmentTypes' | 'preferredRoutes', item: string) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(item)
        ? current.filter((x) => x !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateDriverProfile(formData);
    setIsSaving(false);
  };

  const handleSubmitForReview = async () => {
    setIsSaving(true);
    await updateDriverProfile(formData);
    await submitDriverForReview(driver.id);
    setIsSaving(false);
  };

  // Mock document upload with high-resolution realistic certificate photos
  const handleAddMockDocument = (type: 'cdl_front' | 'dot_medical' | 'mvr' | 'twic') => {
    setIsUploading(true);
    setTimeout(() => {
      const docTemplates = {
        cdl_front: {
          name: `${formData.cdlClass} License Certificate`,
          url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          expirationDate: formData.cdlExpirationDate || '2028-12-31',
        },
        dot_medical: {
          name: 'DOT Medical Examiner Certificate (Form MCSA-5876)',
          url: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&auto=format&fit=crop&q=80',
          expirationDate: '2027-08-30',
        },
        mvr: {
          name: '3-Year Certified Driving Record (Clean MVR)',
          url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
          expirationDate: undefined,
        },
        twic: {
          name: 'TWIC Card Identification',
          url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          expirationDate: '2029-05-15',
        },
      };

      const template = docTemplates[type];
      const newDoc: DriverDocument = {
        id: `doc-${Date.now()}`,
        type,
        name: template.name,
        url: template.url,
        uploadedAt: new Date().toISOString(),
        expirationDate: template.expirationDate,
        verified: false,
      };

      const updatedDocs = [...(formData.documents || []), newDoc];
      handleChange('documents', updatedDocs);
      setIsUploading(false);
      showToast(`Uploaded ${template.name}! Remember to save changes.`, 'success');
    }, 600);
  };

  const handleRemoveDocument = (docId: string) => {
    const updated = (formData.documents || []).filter((d) => d.id !== docId);
    handleChange('documents', updated);
    showToast('Document removed', 'info');
  };

  return (
    <div id="driver-profile-form-container" className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Commercial Driver Profile</h2>
          <p className="text-xs text-slate-500">
            Keep your CDL credentials and route preferences updated for optimal recruiter matching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="driver-save-profile-btn"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            id="driver-submit-review-btn"
            onClick={handleSubmitForReview}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Submit for Admin Moderation</span>
          </button>
        </div>
      </div>

      {/* Section 1: Personal & Contact Information */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">1. Personal & Contact Information</h3>
            <p className="text-xs text-slate-500">Your direct identity and home operating location</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
            <input
              id="input-driver-fullname"
              type="text"
              value={formData.fullName || ''}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="e.g. John Reynolds"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              id="input-driver-email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="driver@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              id="input-driver-phone"
              type="text"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="(555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
            <input
              id="input-driver-city"
              type="text"
              value={formData.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="Indianapolis"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
            <input
              id="input-driver-state"
              type="text"
              value={formData.state || ''}
              onChange={(e) => handleChange('state', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="IN"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Zip Code</label>
            <input
              id="input-driver-zip"
              type="text"
              value={formData.zipCode || ''}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="46204"
            />
          </div>
        </div>
      </div>

      {/* Section 2: CDL Credentials & Endorsements */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">2. Commercial Driver License (CDL) & Endorsements</h3>
            <p className="text-xs text-slate-500">FMCSA license classification and certified endorsements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* CDL Class */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">CDL Class</label>
            <select
              id="select-driver-cdl-class"
              value={formData.cdlClass}
              onChange={(e) => handleChange('cdlClass', e.target.value as CDLClass)}
              className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="Class A">Class A (Tractor-Trailer / Combination)</option>
              <option value="Class B">Class B (Heavy Straight Truck / Bus)</option>
              <option value="Class C">Class C (HazMat Small / Passenger)</option>
            </select>
          </div>

          {/* CDL Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">CDL Number</label>
            <input
              id="input-driver-cdl-number"
              type="text"
              value={formData.cdlNumber || ''}
              onChange={(e) => handleChange('cdlNumber', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="e.g. IN-CDL-8829104A"
            />
          </div>

          {/* CDL Issuing State */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Issuing State</label>
            <input
              id="input-driver-cdl-state"
              type="text"
              value={formData.cdlState || ''}
              onChange={(e) => handleChange('cdlState', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              placeholder="Indiana"
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">License Expiration Date</label>
            <input
              id="input-driver-cdl-exp"
              type="date"
              value={formData.cdlExpirationDate || ''}
              onChange={(e) => handleChange('cdlExpirationDate', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Endorsements Checklist */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Active Endorsements (Check all currently on your license):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {masterData.endorsementTypes.map((endorsement) => {
              const checked = formData.endorsements?.includes(endorsement);
              return (
                <button
                  key={endorsement}
                  type="button"
                  onClick={() => handleToggleArrayItem('endorsements', endorsement)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    checked
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      checked
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span>{endorsement}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience & Driving Record */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Years of Commercial Driving Experience
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-driver-experience-years"
                type="number"
                min="0"
                max="45"
                value={formData.experienceYears ?? 0}
                onChange={(e) => handleChange('experienceYears', parseInt(e.target.value) || 0)}
                className="w-24 px-3 py-2 text-sm font-bold text-center rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <span className="text-xs text-slate-500">years verified behind the wheel</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Driving Record (MVR)</label>
            <div className="flex items-center gap-3 mt-1.5">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.cleanMvr}
                  onChange={(e) => handleChange('cleanMvr', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                />
                <span>Clean Driving Record (0 At-fault accidents)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Moving Violations (Last 3 Years)
            </label>
            <input
              id="input-driver-violations-count"
              type="number"
              min="0"
              max="10"
              value={formData.mvrViolationsCount ?? 0}
              onChange={(e) => handleChange('mvrViolationsCount', parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-2 text-sm text-center rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Equipment, Routes & Compensation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">3. Equipment, Route & Availability Preferences</h3>
            <p className="text-xs text-slate-500">Tell carriers what you haul and your home time goals</p>
          </div>
        </div>

        {/* Equipment Types */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Equipment Types You Operate / Specialize In:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {masterData.equipmentTypes.map((eq) => {
              const checked = formData.equipmentTypes?.includes(eq);
              return (
                <button
                  key={eq}
                  type="button"
                  onClick={() => handleToggleArrayItem('equipmentTypes', eq)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    checked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      checked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span>{eq}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Routes */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Preferred Route Types & Home Time:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {masterData.routeTypes.map((route) => {
              const checked = formData.preferredRoutes?.includes(route);
              return (
                <button
                  key={route}
                  type="button"
                  onClick={() => handleToggleArrayItem('preferredRoutes', route)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    checked
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span>{route}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Availability & Pay Expectations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Availability</label>
            <select
              id="select-driver-availability"
              value={formData.availability}
              onChange={(e) => handleChange('availability', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="immediate">Immediate (Ready to Dispatch)</option>
              <option value="two_weeks">2 Weeks Notice</option>
              <option value="flexible">Flexible / Looking for Right Offer</option>
              <option value="specific_date">Specific Start Date</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Pay ($ / Mile CPM)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">$</span>
              <input
                id="input-driver-cpm"
                type="number"
                step="0.01"
                min="0.40"
                max="1.50"
                value={formData.targetPayPerMile ?? 0.70}
                onChange={(e) => handleChange('targetPayPerMile', parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                placeholder="0.72"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Weekly Gross ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">$</span>
              <input
                id="input-driver-weekly-gross"
                type="number"
                step="50"
                min="1000"
                max="4500"
                value={formData.targetWeeklyGross ?? 2000}
                onChange={(e) => handleChange('targetWeeklyGross', parseInt(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                placeholder="2100"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Professional Summary / Bio for Recruiters
          </label>
          <textarea
            id="textarea-driver-bio"
            rows={3}
            value={formData.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            placeholder="Describe your background, safety accolades, routes you know best, and what you are looking for in a fleet."
          />
        </div>
      </div>

      {/* Section 4: Document Uploads & Verifications */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">4. Required Compliance Documents</h3>
              <p className="text-xs text-slate-500">
                Upload clear scans of your CDL license and DOT Medical Card for admin verification
              </p>
            </div>
          </div>

          {/* Quick upload buttons */}
          <div className="flex items-center gap-2">
            <button
              id="upload-cdl-doc-btn"
              type="button"
              onClick={() => handleAddMockDocument('cdl_front')}
              disabled={isUploading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Add CDL License</span>
            </button>

            <button
              id="upload-dot-doc-btn"
              type="button"
              onClick={() => handleAddMockDocument('dot_medical')}
              disabled={isUploading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Add DOT Medical Card</span>
            </button>
          </div>
        </div>

        {/* Document List */}
        {formData.documents && formData.documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {formData.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      {doc.verified ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">Pending Review</span>
                      )}
                      {doc.expirationDate && <span>• Exp: {doc.expirationDate}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedDocForPreview(doc)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-white transition-colors"
                    title="View Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No documents uploaded yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Please upload your Commercial Driver License (CDL) and DOT Medical Examiner Card to enable admin verification.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleAddMockDocument('cdl_front')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                Upload CDL License
              </button>
              <button
                type="button"
                onClick={() => handleAddMockDocument('dot_medical')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl"
              >
                Upload Medical Card
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Save / Submit Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">
            Profile Status:{' '}
            <strong className="text-white uppercase tracking-wider">{formData.status}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmitForReview}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-all"
          >
            Submit for Admin Moderation
          </button>
        </div>
      </div>

      {/* Document Inspector Modal */}
      {selectedDocForPreview && (
        <DocumentViewerModal
          document={selectedDocForPreview}
          driverName={formData.fullName}
          onClose={() => setSelectedDocForPreview(null)}
        />
      )}
    </div>
  );
};
