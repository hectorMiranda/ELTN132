import { useSettings } from './Settings';
import SearchBar from './SearchBar';
import AuthLogin from './AuthLogin';
import { User } from 'firebase/auth';

interface HeaderProps {
    onMenuClick: () => void;
    user: User | null;
}

export default function Header({ onMenuClick, user }: HeaderProps) {
    const settings = useSettings();

    return (
        <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {settings.searchBarEnabled && user && <SearchBar />}
            </div>

            <div className="flex items-center gap-3">
                <AuthLogin />
            </div>
        </div>
    );
}