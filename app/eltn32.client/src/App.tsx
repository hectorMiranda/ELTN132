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

    // Only show sidebar if user is authenticated AND not on landing page
    const showSidebar = user && !isLandingPage;

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar - only show when authenticated and not on landing page */}
            {showSidebar && (
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header - only show when not on landing page */}
                {!isLandingPage && (
                    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
                        <Header onMenuClick={() => setSidebarOpen(true)} user={user} />
                    </header>
                )}

                {/* Main */}
                <main className={`flex-1 w-full ${!isLandingPage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''}`}>
                    <div className="animate-fadeIn">
                        {children}
                    </div>
                </main>

                {/* Footer - only show when not on landing page */}
                {!isLandingPage && (
                    <footer className="bg-white border-t border-slate-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <Footer />
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
}