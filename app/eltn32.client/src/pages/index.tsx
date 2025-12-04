import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { User } from 'firebase/auth';

export default function Home() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (!auth) return;
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const tools = [
        {
            title: 'Binary ↔ Decimal',
            description: 'Convert between binary and decimal numbers with step-by-step visualization',
            icon: '🔢',
            path: '/binary-to-decimal',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Boolean Expressions',
            description: 'Interactive logic gate simulator with truth tables',
            icon: '⚡',
            path: '/boolean-expressions',
            color: 'from-purple-500 to-pink-500'
        },
        {
            title: 'Boolean Algebra',
            description: 'Explore and prove Boolean algebra identities',
            icon: '🧮',
            path: '/boolean-algebra',
            color: 'from-green-500 to-teal-500'
        },
        {
            title: 'Logic Gates',
            description: 'Learn about AND, OR, NOT, NAND, NOR, XOR gates',
            icon: '🔌',
            path: '/logic-gates',
            color: 'from-orange-500 to-red-500'
        },
        {
            title: 'K-Map Solver',
            description: 'Karnaugh map simplification made easy',
            icon: '🗺️',
            path: '/k-map',
            color: 'from-indigo-500 to-blue-500'
        },
        {
            title: 'MSI Components',
            description: 'Medium-Scale Integration circuits and multiplexers',
            icon: '⚙️',
            path: '/msi',
            color: 'from-yellow-500 to-orange-500'
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            <span className="text-sm font-medium text-blue-100">ELTN 132 Course Tools</span>
                        </div>

                        <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                            Logic Made Simple
                        </h1>

                        <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
                            Interactive tools for mastering digital logic, Boolean algebra, and circuit design
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/binary-to-decimal"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:-translate-y-0.5"
                            >
                                <span>Start Learning</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>

                            {!user && (
                                <Link
                                    href="#features"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all"
                                >
                                    <span>Explore Features</span>
                                </Link>
                            )}
                        </div>

                        {user && (
                            <div className="mt-8 inline-flex items-center gap-2 text-green-400">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Welcome back, {user.displayName || 'User'}!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4">
                        Interactive Learning Tools
                    </h2>
                    <p className="text-xl text-slate-600">
                        Choose a tool to start practicing
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                        <Link
                            key={tool.path}
                            href={tool.path}
                            className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-transparent overflow-hidden"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                            {/* Content */}
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl shadow-lg`}>
                                        {tool.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {tool.title}
                                    </h3>
                                </div>

                                <p className="text-slate-600 mb-4">
                                    {tool.description}
                                </p>

                                <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                                    <span>Try it now</span>
                                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-slate-50 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                                📊
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Track Progress</h3>
                            <p className="text-slate-600">
                                {user ? 'Monitor your learning journey with detailed analytics' : 'Sign in to track your quiz scores and progress'}
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                                🏆
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Challenge Friends</h3>
                            <p className="text-slate-600">
                                {user ? 'Compete with other students in real-time challenges' : 'Login to challenge other users online'}
                            </p>
                            {!user && (
                                <p className="text-sm text-amber-600 mt-2 font-semibold">Coming Soon!</p>
                            )}
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                                ✨
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Interactive Learning</h3>
                            <p className="text-slate-600">
                                Visual, hands-on tools that make complex concepts easy to understand
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            {!user && (
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Ready to Master Digital Logic?
                        </h2>
                        <p className="text-xl mb-8 text-blue-100">
                            Sign in with Google to unlock progress tracking, challenges, and more!
                        </p>
                        <div className="inline-flex items-center gap-2 text-sm text-blue-200">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>Your data is secure and private</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}