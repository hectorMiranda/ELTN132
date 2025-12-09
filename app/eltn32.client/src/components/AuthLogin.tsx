import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';

export default function AuthLogin() {
    const [user, setUser] = useState<User | null>(null);
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Only run on client side
        setIsClient(true);

        // Guard against undefined auth during SSR
        if (!auth) return;

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth) return; // Guard against undefined auth

        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google:", error);
        }
    };

    const handleSignOut = async () => {
        if (!auth) return; // Guard against undefined auth

        try {
            await signOut(auth);
            // Redirect to landing page after sign out
            router.push('/');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Don't render anything during SSR
    if (!isClient) {
        return <div className="w-32 h-9"></div>; // Placeholder to prevent layout shift
    }

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                    <div className="text-sm font-semibold text-slate-800">Hello, {user.displayName?.split(' ')[0] || 'User'}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                
                {user.photoURL && (
                    <div className="relative">
                        <img 
                            src={user.photoURL} 
                            alt={user.displayName || 'User'} 
                            className="w-10 h-10 rounded-full border-2 border-indigo-500 shadow-md object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                )}
                
                <button 
                    onClick={handleSignOut} 
                    className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Sign Out</span>
                </button>
            </div>
        );
    }

    return (
        <button 
            onClick={signInWithGoogle} 
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
        </button>
    );
}