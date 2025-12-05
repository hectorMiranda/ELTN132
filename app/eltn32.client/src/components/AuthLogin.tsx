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
            <div className="flex items-center gap-2">
                <div className="text-sm font-medium">Hello, {user.displayName || 'User'}</div>
                <button onClick={handleSignOut} className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-800 transition-colors">
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <button onClick={signInWithGoogle} className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-800 transition-colors">
            Sign in with Google
        </button>
    );
}