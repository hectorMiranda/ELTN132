import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig'; // Assuming firebaseConfig.ts is in the parent directory
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';

export default function AuthLogin() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">Hello, {user.displayName || 'User'}</div>
        <button onClick={handleSignOut} className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button onClick={signInWithGoogle} className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm">
      Sign in with Google
    </button>
  );
}
