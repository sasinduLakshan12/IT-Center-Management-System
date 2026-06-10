const Footer = () => {
    return (
        <footer className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-slate-800/50 py-6 mt-auto transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center sm:text-left">
                    &copy; {new Date().getFullYear()} University IT Center Management System. All rights reserved.
                </div>
                
                {/* System Operational Badge */}
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs font-semibold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    System Operational
                </div>
            </div>
        </footer>
    );
};

export default Footer;
