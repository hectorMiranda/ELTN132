import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { User } from 'firebase/auth';

interface UserSettings {
    searchBarEnabled: boolean;
    analyticsEnabled: boolean;
}

export default function Settings() {
    const [user, setUser] = useState<User | null>(null);
    const [settings, setSettings] = useState<UserSettings>({
        searchBarEnabled: false,
        analyticsEnabled: true,
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!auth) return;
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.error('Failed to load settings');
            }
        }
    }, []);

    const updateSetting = (key: keyof UserSettings, value: boolean) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        if (typeof window !== 'undefined') {
            localStorage.setItem('userSettings', JSON.stringify(newSettings));
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    return (
        <section className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">⚙️ Settings</h1>
                <p className="text-slate-600">Customize your experience and manage preferences</p>
            </div>

            {/* Save Indicator */}
            {saved && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Settings saved successfully!</span>
                </div>
            )}

            {/* User Info Card */}
            {user ? (
                <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center gap-4">
                        {user.photoURL && (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                            />
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{user.displayName || 'User'}</h2>
                            <p className="text-slate-600">{user.email}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm text-green-600 font-medium">Signed In</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="font-bold text-amber-900">Not Signed In</h3>
                            <p className="text-sm text-amber-700">Sign in to unlock all features and track your progress</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Sections */}
            <div className="space-y-6">
                {/* Features Section */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-bold text-slate-900">Features</h2>
                    </div>

                    <div className="divide-y divide-slate-200">
                        {/* Search Bar Setting */}
                        <div className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <h3 className="font-semibold text-slate-900">Search Bar</h3>
                                        {!user && (
                                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                                                Login Required
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Enable the search functionality to quickly find tools and topics
                                    </p>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.searchBarEnabled && !!user}
                                        onChange={(e) => user && updateSetting('searchBarEnabled', e.target.checked)}
                                        disabled={!user}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-11 h-6 rounded-full peer ${user
                                        ? 'bg-slate-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300'
                                        : 'bg-slate-100 cursor-not-allowed'
                                        } transition-all`}>
                                        <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-all ${settings.searchBarEnabled && user ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Analytics Setting */}
                        <div className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <h3 className="font-semibold text-slate-900">Analytics</h3>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Help us improve by tracking anonymous usage statistics
                                    </p>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.analyticsEnabled}
                                        onChange={(e) => updateSetting('analyticsEnabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 transition-all">
                                        <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-all ${settings.analyticsEnabled ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-bold text-slate-900">About</h2>
                    </div>

                    <div className="p-6">
                        <p className="text-slate-600 leading-relaxed mb-4">
                            <strong className="text-slate-900">Logic Tools for ELTN132</strong> -
                            Interactive learning tools designed for digital logic and Boolean algebra courses.
                        </p>

                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-200">
                            <div>
                                <p className="text-sm text-slate-500">Version</p>
                                <p className="font-semibold text-slate-900">1.0.0</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Status</p>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <p className="font-semibold text-green-600">Online</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-500">
                                © {new Date().getFullYear()} ELTN132 Logic Tools. Built for students, by students.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Export hook to use settings in other components
export function useSettings(): UserSettings {
    const [settings, setSettings] = useState<UserSettings>({
        searchBarEnabled: false,
        analyticsEnabled: true,
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = localStorage.getItem('userSettings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []);

    return settings;
}

// Export the type as well
export type { UserSettings };