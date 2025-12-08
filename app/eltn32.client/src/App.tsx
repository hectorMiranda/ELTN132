import { useState, useEffect } from 'react';
import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebaseConfig';

interface AppProps {
    children?: ReactNode;
}

export default function AppLayout({ children }: AppProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!auth) return;

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Check if current page is the landing page
    const isLandingPage = router.pathname === '/';

    // Show sidebar when user is logged in
    const showSidebar = !!user;

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar - show when authenticated */}
            {showSidebar && (
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            )}

            {/* Main Content - FULL WIDTH */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header - show when logged in (not on landing when logged out) */}
                {(user || !isLandingPage) && (
                    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
                        <Header onMenuClick={() => setSidebarOpen(true)} user={user} />
                    </header>
                )}

                {/* Main - NO MAX WIDTH, use full available space */}
                <main className={`flex-1 w-full ${!isLandingPage || user ? 'px-4 sm:px-6 lg:px-8 py-6' : ''}`}>
                    <div className="animate-fadeIn h-full">
                        {children}
                    </div>
                </main>

                {/* Footer - compact */}
                {(!isLandingPage || user) && (
                    <footer className="bg-white border-t border-slate-200">
                        <div className="px-4 sm:px-6 lg:px-8 py-3">
                            <Footer />
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
}