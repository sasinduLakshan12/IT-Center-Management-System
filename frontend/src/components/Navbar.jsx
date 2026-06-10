import { useAuthStore } from '../store/authStore';
import { Monitor, LogOut, User, ShieldAlert, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return (
                    <span className="flex items-center gap-1 text-xs font-bold bg-rose-500/10 text-rose-500 px-2.5 py-1 rounded-full border border-rose-500/20 shadow-sm shadow-rose-500/5 uppercase tracking-wide">
                        <ShieldAlert className="w-3 h-3" /> Admin
                    </span>
                );
            case 'lecturer':
                return (
                    <span className="flex items-center gap-1 text-xs font-bold bg-violet-500/10 text-violet-500 px-2.5 py-1 rounded-full border border-violet-500/20 shadow-sm shadow-violet-500/5 uppercase tracking-wide">
                        <BookOpen className="w-3 h-3" /> Lecturer
                    </span>
                );
            case 'student':
            default:
                return (
                    <span className="flex items-center gap-1 text-xs font-bold bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-full border border-blue-500/20 shadow-sm shadow-blue-500/5 uppercase tracking-wide">
                        <User className="w-3 h-3" /> Student
                    </span>
                );
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Brand Logo */}
                    <div 
                        className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 cursor-pointer group"
                        onClick={() => navigate('/dashboard')}
                    >
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-sm shadow-blue-100 dark:shadow-none">
                            <Monitor className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            IT Center
                        </span>
                    </div>

                    {/* Right profile info & logout */}
                    {user && (
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="flex items-center gap-3 border-r border-gray-100 dark:border-slate-850 pr-4 sm:pr-6">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-none mb-1">
                                        {user.name}
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        ID: {user.studentId}
                                    </div>
                                </div>
                                {getRoleBadge(user.role)}
                            </div>

                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/30 dark:text-gray-400 dark:hover:text-rose-400 px-3.5 py-2 rounded-xl text-sm font-semibold border border-gray-200/50 hover:border-rose-200 dark:border-slate-700/50 dark:hover:border-rose-900/30 transition-all duration-200 cursor-pointer shadow-sm shadow-gray-100 dark:shadow-none"
                            >
                                <LogOut className="w-4 h-4 stroke-[2.5]" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
