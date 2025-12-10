import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebaseConfig';
import { type User, onAuthStateChanged } from 'firebase/auth';

interface ProtectedRouteProps {
    children: React.ReactNode | ((user: User | null) => React.ReactNode);
    allowGuest?: boolean;
}

export default function ProtectedRoute({ children, allowGuest = false }: ProtectedRouteProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!auth) {
            if (!allowGuest) {
                router.push('/');
            } else {
                setLoading(false);
            }
            return;
        }

        // Listen to auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser && !allowGuest) {
                // User not authenticated and guest mode not allowed, redirect to home
                router.push('/');
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, allowGuest]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user && !allowGuest) {
        return null; // Will redirect in useEffect
    }

    // Support render prop pattern to pass user state
    return <>{typeof children === 'function' ? children(user) : children}</>;
}
