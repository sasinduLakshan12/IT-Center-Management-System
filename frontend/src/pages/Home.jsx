import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';
import { Monitor, ArrowRight, ShieldCheck, Clock, Zap, BookOpen } from 'lucide-react';
import Footer from '../components/Footer';

const Home = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
            {/* Background Image with Dark & Gradient Overlays */}
            <div 
                className="absolute inset-0 bg-cover bg-center z-0 scale-105 filter blur-[2px] opacity-40 transition-transform duration-1000"
                style={{ backgroundImage: `url('/modern_it_lab.png')` }}
            ></div>
            
            {/* Dark & Gradient Grids */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/90 to-slate-900/60 z-0"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 z-0"></div>

            {/* Glowing Accent Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-blue-600/10 rounded-full filter blur-[120px] pointer-events-none z-0 animate-pulse duration-[8s]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full filter blur-[100px] pointer-events-none z-0 animate-pulse duration-[12s]"></div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Navbar (Landing Page specific) */}
                <header className="w-full bg-slate-950/20 backdrop-blur-md border-b border-white/5 py-4">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <div className="flex items-center gap-2.5 text-blue-400">
                            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <Monitor className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                IT Center
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <Link 
                                to="/login" 
                                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition duration-200"
                            >
                                Sign In
                            </Link>
                            <Link 
                                to="/register" 
                                className="px-4.5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition duration-200"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 py-16">
                    {/* Left Column: Title & Features */}
                    <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl lg:max-w-none">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 uppercase tracking-wider shadow-sm">
                            <Zap className="w-3.5 h-3.5 fill-current animate-bounce" /> Smart PC Allocation System
                        </div>
                        
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                            Maximize Your Lab <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Productivity & Focus
                            </span>
                        </h1>

                        <p className="text-lg text-slate-400 font-medium leading-relaxed">
                            Welcome to the University IT Center PC Booking System. Register your student or staff profile, reserve high-performance workstations, check in dynamically, and manage your daily quota effortlessly.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link 
                                to="/register" 
                                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30 transition-all duration-200 cursor-pointer"
                            >
                                Book a Workstation 
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                to="/login" 
                                className="flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition duration-200 cursor-pointer"
                            >
                                Member Dashboard
                            </Link>
                        </div>

                        {/* Interactive Features Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex gap-3 items-start">
                                <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-white text-sm">3-Hr Daily Quota</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">Enforcing fairness across student users.</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex gap-3 items-start">
                                <BookOpen className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-white text-sm">Lecturer Access</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">Academic profiles get unlimited daily quota.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Glassmorphism Promo Card */}
                    <div className="flex-1 w-full max-w-md">
                        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-2xl p-8 space-y-6 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
                            
                            <div className="flex justify-between items-center">
                                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                                    <Monitor className="w-7 h-7 stroke-[2.5]" />
                                </div>
                                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase tracking-wide">
                                    Active Labs
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white tracking-tight">IT Center Status</h3>
                                <p className="text-sm text-slate-400">
                                    Monitor lab seats and book your computer before walking in.
                                </p>
                            </div>

                            {/* Stat details inside glass box */}
                            <div className="space-y-3.5">
                                <div className="flex justify-between items-center p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                    <span className="text-sm font-semibold text-slate-300">Total Available PCs</span>
                                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Online (40 seats)
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                    <span className="text-sm font-semibold text-slate-300">Smart Check-In</span>
                                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                                        15-Min Hold Timeout
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                    <span className="text-sm font-semibold text-slate-300">Security Clearance</span>
                                    <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-blue-400" /> Admin Approved
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Link 
                                    to="/login"
                                    className="w-full flex justify-center py-3 px-4 border border-white/10 hover:border-white/20 rounded-xl shadow-lg text-sm font-bold text-white bg-white/5 hover:bg-white/10 transition-all duration-200"
                                >
                                    Log In to Book Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer Component */}
                <Footer />
            </div>
        </div>
    );
};

export default Home;
