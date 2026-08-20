import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { DemoRoleBar } from './components/common/DemoRoleBar';
import { DriverDashboard } from './components/driver/DriverDashboard';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRole, toasts = [], removeToast } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Demo Persona Switching Header */}
      <DemoRoleBar />

      {/* Main App Navigation Bar */}
      <Header />

      {/* Role-Specific Active View */}
      <main className="flex-1 pb-16">
        {currentRole === 'driver' && <DriverDashboard />}
        {currentRole === 'recruiter' && <RecruiterDashboard />}
        {currentRole === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2025 TruckLink Commercial Logistics Network. USDOT Compliant Matching & Onboarding.</p>
          <p className="text-slate-400">Powered by TypeScript, Node.js & Firebase Firestore Cloud Database</p>
        </div>
      </footer>

      {/* Global Toast Notifications Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transition-all animate-in slide-in-from-bottom-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-amber-100 border-amber-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800'
                : 'bg-slate-900 text-slate-100 border-slate-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs font-semibold">{toast.message}</div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
