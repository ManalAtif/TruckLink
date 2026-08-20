import React, { useState } from 'react';
import { JobPosting, CDLClass } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { X, Plus, Trash2, Building2, Shield, Truck, DollarSign, MapPin } from 'lucide-react';

interface JobPostModalProps {
  jobToEdit?: JobPosting | null;
  onClose: () => void;
}

export const JobPostModal: React.FC<JobPostModalProps> = ({ jobToEdit, onClose }) => {
  const { createJobPosting, updateJobPosting, masterData, currentRecruiter, showToast } = useAuth();

  const [title, setTitle] = useState(jobToEdit?.title || '');
  const [description, setDescription] = useState(jobToEdit?.description || '');
  const [routeType, setRouteType] = useState<JobPosting['routeType']>(
    jobToEdit?.routeType || 'Over-The-Road (OTR)'
  );
  const [equipmentType, setEquipmentType] = useState(
    jobToEdit?.equipmentType || masterData.equipmentTypes[0] || 'Dry Van'
  );
  const [cdlClassRequired, setCdlClassRequired] = useState<CDLClass>(
    jobToEdit?.cdlClassRequired || 'Class A'
  );
  const [endorsementsRequired, setEndorsementsRequired] = useState<string[]>(
    jobToEdit?.endorsementsRequired || []
  );
  const [minExperienceYears, setMinExperienceYears] = useState<number>(
    jobToEdit?.minExperienceYears ?? 2
  );
  const [payDescription, setPayDescription] = useState(
    jobToEdit?.payDescription || '$0.72 - $0.78 CPM + $5,000 Sign-On Bonus'
  );
  const [avgWeeklyPay, setAvgWeeklyPay] = useState<number>(jobToEdit?.avgWeeklyPay || 2100);
  const [operatingRegions, setOperatingRegions] = useState<string[]>(
    jobToEdit?.operatingRegions || ['Midwest', 'National (Lower 48)']
  );
  const [benefits, setBenefits] = useState<string[]>(
    jobToEdit?.benefits || [
      'Comprehensive Medical/Dental/Vision after 30 days',
      '401(k) with 4% company match',
      'New 2024 Freightliner Cascadia with APU & Invertor',
      'Rider & Pet Friendly from Day 1',
    ]
  );
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleEndorsement = (item: string) => {
    setEndorsementsRequired((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const toggleRegion = (reg: string) => {
    setOperatingRegions((prev) =>
      prev.includes(reg) ? prev.filter((x) => x !== reg) : [...prev, reg]
    );
  };

  const addBenefit = () => {
    if (newBenefitInput.trim()) {
      setBenefits((prev) => [...prev, newBenefitInput.trim()]);
      setNewBenefitInput('');
    }
  };

  const removeBenefit = (idx: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please fill in title and description', 'warning');
      return;
    }

    setIsSubmitting(true);
    if (jobToEdit) {
      await updateJobPosting(jobToEdit.id, {
        title,
        description,
        routeType,
        equipmentType,
        cdlClassRequired,
        endorsementsRequired,
        minExperienceYears,
        payDescription,
        avgWeeklyPay,
        operatingRegions,
        benefits,
      });
    } else {
      await createJobPosting({
        title,
        description,
        routeType,
        equipmentType,
        cdlClassRequired,
        endorsementsRequired,
        minExperienceYears,
        payDescription,
        avgWeeklyPay,
        operatingRegions,
        benefits,
        status: 'active',
      });
    }
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {jobToEdit ? 'Edit Driving Position' : 'Post New Driving Position'}
              </h3>
              <p className="text-xs text-slate-500">
                {currentRecruiter?.companyName} • Define exact driver qualifications for smart matching
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Job Title & Route Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                placeholder="e.g. OTR Reefer Dedicated Route Driver"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Route Type</label>
              <select
                value={routeType}
                onChange={(e) => setRouteType(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              >
                {masterData.routeTypes.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Position Overview</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              placeholder="Describe the lanes, home time schedule, equipment specs, and culture."
            />
          </div>

          {/* Qualifications: CDL Class, Equipment, Min Exp */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required CDL Class</label>
              <select
                value={cdlClassRequired}
                onChange={(e) => setCdlClassRequired(e.target.value as CDLClass)}
                className="w-full px-3.5 py-2 text-sm font-bold rounded-xl border border-slate-300 bg-white text-blue-700"
              >
                <option value="Class A">Class A (Tractor-Trailer)</option>
                <option value="Class B">Class B (Straight Truck)</option>
                <option value="Class C">Class C (Commercial Van)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Equipment Type</label>
              <select
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white"
              >
                {masterData.equipmentTypes.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Min. Years Experience
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={minExperienceYears}
                onChange={(e) => setMinExperienceYears(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-bold text-center rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Required Endorsements */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Required Endorsements (Candidate must hold these for 100% match):
            </label>
            <div className="flex flex-wrap gap-2">
              {masterData.endorsementTypes.map((end) => {
                const active = endorsementsRequired.includes(end);
                return (
                  <button
                    key={end}
                    type="button"
                    onClick={() => toggleEndorsement(end)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {end}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pay & Compensation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pay Structure & Rate Summary
              </label>
              <input
                type="text"
                value={payDescription}
                onChange={(e) => setPayDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                placeholder="e.g. $0.74 - $0.78 CPM + $5k Bonus"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Est. Average Weekly Gross ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm font-bold">$</span>
                <input
                  type="number"
                  step="50"
                  value={avgWeeklyPay}
                  onChange={(e) => setAvgWeeklyPay(parseInt(e.target.value) || 0)}
                  className="w-full pl-7 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Operating Regions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Operating Lanes / Regions:
            </label>
            <div className="flex flex-wrap gap-2">
              {masterData.regions.map((reg) => {
                const selected = operatingRegions.includes(reg);
                return (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => toggleRegion(reg)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {selected ? '✓ ' : ''}
                    {reg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Benefits Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Carrier Benefits & Equipment Highlights:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {benefits.map((b, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg"
                >
                  <span>✓ {b}</span>
                  <button
                    type="button"
                    onClick={() => removeBenefit(idx)}
                    className="text-emerald-600 hover:text-emerald-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newBenefitInput}
                onChange={(e) => setNewBenefitInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                placeholder="Add perk (e.g. Free EpicVue satellite TV, Pet friendly)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
              <button
                type="button"
                onClick={addBenefit}
                className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl"
              >
                + Add Perk
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
          >
            {jobToEdit ? 'Save Position Changes' : 'Publish Driving Position'}
          </button>
        </div>
      </div>
    </div>
  );
};
