import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

interface UserSettings {
  searchBarEnabled: boolean;
  analyticsEnabled: boolean;
  darkMode: boolean;
}

export default function Settings({ isOpen, onClose, user }: SettingsProps) {
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    searchBarEnabled: false,
    analyticsEnabled: true,
    darkMode: false,
  });

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const updateSetting = (key: keyof UserSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
    }
  };

  // Don't render during SSR or when closed
  if (!isClient || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-[101] transform transition-transform animate-slideInRight">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-xl font-bold text-slate-900">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              aria-label="Close settings"
            >
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* User Info */}
            {user ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{user.displayName || 'User'}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-amber-800">Sign in to enable all features</p>
                </div>
              </div>
            )}

            {/* Settings List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Features</h3>

              {/* Search Bar Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h4 className="font-semibold text-slate-900">Search Bar</h4>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {user ? 'Enable search functionality' : 'Login required'}
                  </p>
                </div>
                <label className="relative inline-block w-12 h-6 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.searchBarEnabled && !!user}
                    onChange={(e) => user && updateSetting('searchBarEnabled', e.target.checked)}
                    disabled={!user}
                    className="sr-only peer"
                  />
                  <span className={`absolute inset-0 rounded-full transition-colors ${
                    user ? 'bg-slate-300 peer-checked:bg-blue-600 cursor-pointer' : 'bg-slate-200 cursor-not-allowed'
                  }`} />
                  <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                    settings.searchBarEnabled && user ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </label>
              </div>

              {/* Analytics Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h4 className="font-semibold text-slate-900">Analytics</h4>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Track usage for improvements</p>
                </div>
                <label className="relative inline-block w-12 h-6 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.analyticsEnabled}
                    onChange={(e) => updateSetting('analyticsEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <span className="absolute inset-0 bg-slate-300 rounded-full peer-checked:bg-blue-600 cursor-pointer transition-colors" />
                  <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                    settings.analyticsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </label>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg opacity-60">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <h4 className="font-semibold text-slate-900">Dark Mode</h4>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Coming soon...</p>
                </div>
                <label className="relative inline-block w-12 h-6 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    disabled
                    className="sr-only peer"
                  />
                  <span className="absolute inset-0 bg-slate-200 rounded-full cursor-not-allowed" />
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </label>
              </div>
            </div>

            {/* About Section */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">About</h3>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Logic Tools for ELTN132 - Interactive learning tools for digital logic and Boolean algebra.
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">Version 1.0.0</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-slate-500">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Export hook to use settings
export function useSettings(): UserSettings {
  const [settings, setSettings] = useState<UserSettings>({
    searchBarEnabled: false,
    analyticsEnabled: true,
    darkMode: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  return settings;
}