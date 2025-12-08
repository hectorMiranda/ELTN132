import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { User } from 'firebase/auth';

interface UserSettings {
    searchBarEnabled: boolean;
    darkModeEnabled: boolean;
    notificationsEnabled: boolean;
}

export default function Settings() {
    const [user, setUser] = useState<User | null>(null);
    const [settings, setSettings] = useState<UserSettings>({
        searchBarEnabled: false,
        darkModeEnabled: false,
        notificationsEnabled: true,
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

                        {/* Dark Mode Setting */}
                        <div className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        </svg>
                                        <h3 className="font-semibold text-slate-900">Dark Mode</h3>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                            Coming Soon
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Switch to a dark color scheme for reduced eye strain
                                    </p>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.darkModeEnabled}
                                        onChange={(e) => updateSetting('darkModeEnabled', e.target.checked)}
                                        disabled={true}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-100 rounded-full peer cursor-not-allowed transition-all">
                                        <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-all ${settings.darkModeEnabled ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Notifications Setting */}
                        <div className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        <h3 className="font-semibold text-slate-900">Notifications</h3>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Receive updates about new tools, features, and course materials
                                    </p>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.notificationsEnabled}
                                        onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 transition-all">
                                        <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-all ${settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
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
        darkModeEnabled: false,
        notificationsEnabled: true,
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