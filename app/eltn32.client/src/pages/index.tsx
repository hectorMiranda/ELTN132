import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import type { User } from 'firebase/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { TOOLS, CATEGORIES, getToolsByCategory } from '../config/tools';
import { getUserData } from '../utils/azureApi';
import type { UserData } from '../types/game';

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!auth) return;
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleSignIn = async () => {
        if (!auth) return;

        setIsLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const [userData, setUserData] = useState<UserData | null>(null);
    const [loadingUserData, setLoadingUserData] = useState(false);

    // Fetch user data from Azure Functions when user logs in
    useEffect(() => {
        if (user?.email) {
            loadUserData();
        } else {
            setUserData(null);
        }
    }, [user]);

    const loadUserData = async () => {
        if (!user?.email) return;

        setLoadingUserData(true);
        const response = await getUserData(user.email);
        if (response.success && response.data) {
            setUserData(response.data);
        }
        setLoadingUserData(false);
    };

    // Calculate user activity from real data
    const userActivity = {
        totalScore: userData?.features.reduce((sum, f) => sum + f.recentScore, 0) || 0,
        completedTools: userData?.features.length || 0,
        lastActivity: userData?.lastUpdated
            ? getTimeAgo(new Date(userData.lastUpdated))
            : 'Never',
        recentScores: userData?.features
            .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
            .slice(0, 3)
            .map(f => ({
                tool: getToolName(f.featureName),
                score: f.recentScore,
                date: getTimeAgo(new Date(f.lastUpdated)),
            })) || [],
        streak: 0, // TODO: Calculate streak from activity data
    };

    // Helper function to get tool display name from feature name
    function getToolName(featureName: string): string {
        const toolMap: Record<string, string> = {
            'bin2dec': 'Binary to Decimal',
            'dec2bin': 'Decimal to Binary',
            'boolean-algebra': 'Boolean Algebra',
            'k-map': 'K-Map Solver',
            'logic-gates': 'Logic Gates',
        };
        return toolMap[featureName] || featureName;
    }

    // Helper function to get relative time
    function getTimeAgo(date: Date): string {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    return (
        <div className="min-h-screen">
            {user ? (
                /* Logged In - Compact Dashboard using FULL WIDTH */
                <div className="h-full">
                    {/* Compact Hero - Reduced Padding */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-6">
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                        <div className="relative px-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                                {user.photoURL && (
                                    <img
                                        src={user.photoURL}
                                        alt="Profile"
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-blue-500 shadow-lg"
                                    />
                                )}
                                <div className="flex-1">
                                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                                        Welcome back, {user.displayName?.split(' ')[0] || 'Student'}! 👋
                                    </h1>
                                    <p className="text-sm text-slate-300">Ready to continue learning?</p>
                                </div>
                            </div>

                            {/* Horizontal Stats - Single Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
                                    <div className="text-xl sm:text-2xl font-bold text-cyan-400">{userActivity.totalScore}</div>
                                    <div className="text-xs text-slate-300">Total Points</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
                                    <div className="text-xl sm:text-2xl font-bold text-green-400">{userActivity.completedTools}/{TOOLS.length}</div>
                                    <div className="text-xs text-slate-300">Tools Unlocked</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
                                    <div className="text-xl sm:text-2xl font-bold text-orange-400">{userActivity.streak}</div>
                                    <div className="text-xs text-slate-300">Day Streak 🔥</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
                                    <div className="text-xs font-semibold text-purple-400">Last Active</div>
                                    <div className="text-sm text-slate-300">{userActivity.lastActivity}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area - 2 Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">

                        {/* Left: Recent Activity - Compact Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm sticky top-20">
                                <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-slate-800">
                                    <span>📊</span>
                                    <span>Recent Scores</span>
                                </h3>
                                <div className="space-y-2">
                                    {userActivity.recentScores.map((score, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                                            <span className="text-slate-700 font-medium">{score.tool}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400">{score.date}</span>
                                                <span className={`font-bold text-sm ${score.score >= 90 ? 'text-green-600' : score.score >= 80 ? 'text-yellow-600' : 'text-orange-600'}`}>
                                                    {score.score}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Quick Actions</h4>
                                    <div className="space-y-2">
                                        <Link href="/settings" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            ⚙️ Settings
                                        </Link>
                                        <button className="block text-sm text-slate-600 hover:text-slate-700 font-medium">
                                            📈 View All Progress
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Tools Grid - Takes More Space */}
                        <div className="lg:col-span-2">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">
                                Continue Learning
                            </h2>

                            {/* Tools organized by category - More compact */}
                            {CATEGORIES.map(category => {
                                const categoryTools = getToolsByCategory(category.key);
                                if (categoryTools.length === 0) return null;

                                return (
                                    <div key={category.key} className="mb-6">
                                        <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                            <span>{category.icon}</span>
                                            <span>{category.label}</span>
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {categoryTools.map((tool) => (
                                                <Link
                                                    key={tool.path}
                                                    href={tool.path}
                                                    className="group relative bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 hover:border-blue-300 overflow-hidden"
                                                >
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                                                    <div className="relative flex items-start gap-3">
                                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-lg shadow-sm flex-shrink-0`}>
                                                            {tool.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm mb-1">
                                                                {tool.title}
                                                            </h4>
                                                            <p className="text-xs text-slate-600 line-clamp-2">
                                                                {tool.description}
                                                            </p>
                                                        </div>
                                                        <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                /* Not Logged In - Show Full Landing Page */
                <>
                    {/* Compact Hero Section */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5 mb-4">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    <span className="text-xs font-medium text-blue-100">ELTN 132 Course Tools</span>
                                </div>

                                <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                                    Logic Made Simple
                                </h1>

                                <p className="text-lg sm:text-xl text-slate-300 mb-6 max-w-2xl mx-auto">
                                    Master digital logic, Boolean algebra, and circuit design with {TOOLS.length} interactive tools
                                </p>

                                <button
                                    onClick={handleSignIn}
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Signing In...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span>Sign in with Google</span>
                                        </>
                                    )}
                                </button>

                                <p className="mt-4 text-sm text-slate-400">
                                    Track your progress, compete with friends, and unlock achievements
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tools Grid - Full Width, More Columns */}
                    <div className="px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                                Interactive Learning Tools
                            </h2>
                            <p className="text-slate-600">
                                Sign in to track your progress across {TOOLS.length} tools
                            </p>
                        </div>

                        {/* Show tools by category - 4 columns on large screens */}
                        {CATEGORIES.map(category => {
                            const categoryTools = getToolsByCategory(category.key);
                            if (categoryTools.length === 0) return null;

                            return (
                                <div key={category.key} className="mb-8">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <span className="text-xl">{category.icon}</span>
                                        <span>{category.label}</span>
                                        <span className="text-sm font-normal text-slate-400">({categoryTools.length})</span>
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {categoryTools.map((tool) => (
                                            <button
                                                key={tool.path}
                                                onClick={handleSignIn}
                                                disabled={isLoading}
                                                className="group relative bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 hover:border-blue-300 overflow-hidden text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                                <div className="relative">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-lg shadow-sm opacity-50`}>
                                                            {tool.icon}
                                                        </div>
                                                        <h3 className="text-sm font-bold text-slate-900">
                                                            {tool.title}
                                                        </h3>
                                                    </div>

                                                    <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                                                        {tool.description}
                                                    </p>

                                                    <div className="flex items-center text-amber-600 font-semibold text-xs gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Sign in</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Compact Features Section */}
                    <div className="bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-xl mx-auto mb-2">
                                    📊
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Track Progress</h3>
                                <p className="text-xs text-slate-600">
                                    Sign in to track your learning journey
                                </p>
                            </div>

                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xl mx-auto mb-2">
                                    🏆
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Build Streaks</h3>
                                <p className="text-xs text-slate-600">
                                    Login to compete and earn badges
                                </p>
                            </div>

                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-xl mx-auto mb-2">
                                    ✨
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Interactive Learning</h3>
                                <p className="text-xs text-slate-600">
                                    Visual tools that make complex concepts easy
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}