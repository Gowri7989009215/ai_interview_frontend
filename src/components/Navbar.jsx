import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar({ minimal = false }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out');
        navigate('/login');
    };

    return (
        <nav className="glass border-b border-white/5 px-6 py-4 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-black text-xs">PI</div>
                    <span className="font-bold text-white">ProInterview <span className="text-gradient">AI</span></span>
                </Link>

                {!minimal && (
                    <div className="flex items-center gap-6">
                        <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">Dashboard</Link>
                        <Link to="/interview/setup" className="text-gray-400 hover:text-white text-sm transition-colors">New Interview</Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="text-amber-400 hover:text-amber-300 text-sm transition-colors font-medium">Admin</Link>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium text-white">{user.name}</div>
                                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-gray-500 hover:text-red-400 text-sm transition-colors"
                                title="Logout"
                            >
                                ⌂
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
