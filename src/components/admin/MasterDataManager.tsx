import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MasterData } from '../../types';
import { Database, Plus, Trash2, Save, RefreshCw, CheckCircle2, Shield } from 'lucide-react';

export const MasterDataManager: React.FC = () => {
  const { masterData, updateMasterDataList, showToast } = useAuth();

  const [activeCategory, setActiveCategory] = useState<keyof MasterData>('endorsementTypes');
  const [newItemInput, setNewItemInput] = useState('');

  const categories: { id: keyof MasterData; label: string; description: string }[] = [
    {
      id: 'endorsementTypes',
      label: 'CDL Endorsement Types',
      description: 'Endorsements verified on commercial licenses (HazMat, Tanker, TWIC, etc.)',
    },
    {
      id: 'equipmentTypes',
      label: 'Trailer & Equipment Types',
      description: 'Fleet freight types (Reefer, Dry Van, Tanker, Flatbed, Auto Hauler)',
    },
    {
      id: 'routeTypes',
      label: 'Route & Dispatch Classifications',
      description: 'Home time and route schedules (OTR, Regional, Local, Dedicated)',
    },
    {
      id: 'regions',
      label: 'Operating Regions & Corridors',
      description: 'Geographic market lanes across North America',
    },
  ];

  const currentItems = masterData[activeCategory] || [];

  const handleAddItem = async () => {
    if (!newItemInput.trim()) return;
    if (currentItems.includes(newItemInput.trim())) {
      showToast('Item already exists in this master list', 'warning');
      return;
    }
    const updated = [...currentItems, newItemInput.trim()];
    await updateMasterDataList(activeCategory, updated);
    setNewItemInput('');
  };

  const handleRemoveItem = async (itemToRemove: string) => {
    const updated = currentItems.filter((i) => i !== itemToRemove);
    await updateMasterDataList(activeCategory, updated);
  };

  return (
    <div id="master-data-manager" className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-700" />
            <span>Platform Master Data Configuration</span>
          </h3>
          <p className="text-xs text-slate-500">
            Control standard reference values for CDL endorsements, equipment types, and routes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories navigation */}
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-purple-50 border-purple-300 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">{cat.label}</h4>
                <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {masterData[cat.id]?.length || 0}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
            </button>
          ))}
        </div>

        {/* Category Items Editor */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {categories.find((c) => c.id === activeCategory)?.label}
              </h4>
              <p className="text-xs text-slate-500">
                Changes are instantly synced to all Driver & Recruiter dropdowns
              </p>
            </div>
          </div>

          {/* Add Item Row */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemInput}
              onChange={(e) => setNewItemInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
              placeholder={`Add new ${categories.find((c) => c.id === activeCategory)?.label.toLowerCase()}...`}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500/20"
            />
            <button
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Master List</span>
            </button>
          </div>

          {/* List of active items */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pt-2">
            {currentItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:bg-slate-100/70 transition-colors"
              >
                <span className="font-semibold text-slate-800">{item}</span>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                  title="Remove from list"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
