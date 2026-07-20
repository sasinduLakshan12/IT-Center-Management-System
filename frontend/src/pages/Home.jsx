import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Monitor, ArrowRight, ShieldCheck, Clock, Zap, BookOpen, Sun, Moon, Users, Cpu, Calendar, CheckCircle, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    });

    const [liveStats, setLiveStats] = useState({
        totalComputers: 0,
        availableComputers: 0,
        totalStudents: 0,
        totalBookingsToday: 0,
        status: 'Online'
    });

    useEffect(() => {
        const fetchLiveStats = async () => {
            try {
                const { data } = await API.get('/reports/public-stats');
                if (data.success && data.data) {
                    setLiveStats(data.data);
                }
            } catch (e) {
                console.error('Failed to fetch public stats:', e);
            }
        };
        fetchLiveStats();
    }, []);

    useEffect(() => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    const dashboardLink = user 
        ? (user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard')
        : '/login';

    // Theme tokens
    const t = isDark ? {
        bg: 'linear-gradient(135deg, #060614 0%, #0d0d2b 40%, #150d24 100%)',
        navBg: 'rgba(10,10,30,0.7)',
        navBorder: 'rgba(255,255,255,0.08)',
        cardBg: 'rgba(255,255,255,0.04)',
        cardBorder: 'rgba(255,255,255,0.1)',
        cardBgHover: 'rgba(255,255,255,0.07)',
        text: '#f0f0ff',
        textSub: 'rgba(200,200,230,0.7)',
        textMuted: 'rgba(180,180,210,0.45)',
        orb1: 'rgba(100,80,255,0.18)',
        orb2: 'rgba(0,180,255,0.12)',
        orb3: 'rgba(180,60,255,0.1)',
        featureBg: 'rgba(255,255,255,0.03)',
        featureBorder: 'rgba(255,255,255,0.08)',
        statBg: 'rgba(0,0,0,0.2)',
        statBorder: 'rgba(255,255,255,0.06)',
        btnSecBg: 'rgba(255,255,255,0.05)',
        btnSecBorder: 'rgba(255,255,255,0.15)',
        btnSecText: '#fff',
        toggleBg: 'rgba(255,255,255,0.1)',
        toggleBorder: 'rgba(255,255,255,0.15)',
        footerBg: 'rgba(0,0,0,0.3)',
        footerBorder: 'rgba(255,255,255,0.06)',
        footerText: 'rgba(200,200,230,0.45)',
        gridColor: 'rgba(255,255,255,0.03)',
    } : {
        bg: 'linear-gradient(135deg, #f0f2ff 0%, #e8ecff 40%, #f5f0ff 100%)',
        navBg: 'rgba(255,255,255,0.75)',
        navBorder: 'rgba(0,0,0,0.08)',
        cardBg: 'rgba(255,255,255,0.85)',
        cardBorder: 'rgba(0,0,0,0.08)',
        cardBgHover: 'rgba(255,255,255,0.95)',
        text: '#0f0f2e',
        textSub: 'rgba(30,30,80,0.7)',
        textMuted: 'rgba(30,30,80,0.4)',
        orb1: 'rgba(100,80,255,0.12)',
        orb2: 'rgba(0,160,255,0.1)',
        orb3: 'rgba(160,60,255,0.08)',
        featureBg: 'rgba(255,255,255,0.7)',
        featureBorder: 'rgba(0,0,0,0.08)',
        statBg: 'rgba(255,255,255,0.8)',
        statBorder: 'rgba(0,0,0,0.07)',
        btnSecBg: 'rgba(255,255,255,0.9)',
        btnSecBorder: 'rgba(0,0,0,0.12)',
        btnSecText: '#0f0f2e',
        toggleBg: 'rgba(0,0,0,0.06)',
        toggleBorder: 'rgba(0,0,0,0.1)',
        footerBg: 'rgba(0,0,0,0.04)',
        footerBorder: 'rgba(0,0,0,0.07)',
        footerText: 'rgba(30,30,80,0.45)',
        gridColor: 'rgba(0,0,0,0.04)',
    };

    const features = [
        { icon: <Clock size={20} />, color: '#7b61ff', label: '3-Hr Daily Quota', desc: 'Fair usage enforced for all students' },
        { icon: <ShieldCheck size={20} />, color: '#00d2ff', label: 'Admin Approved', desc: 'Verified student accounts only' },
        { icon: <BookOpen size={20} />, color: '#00e676', label: 'Smart Booking', desc: 'Reserve your PC in advance' },
        { icon: <Zap size={20} />, color: '#ff9800', label: 'Instant Check-In', desc: '15-min hold timeout system' },
    ];

    const stats = [
        { icon: <Cpu size={18} />, color: '#7b61ff', label: 'Total PCs', value: `${liveStats.totalComputers} Seats (${liveStats.availableComputers} Free)`, pulse: true },
        { icon: <Users size={18} />, color: '#00d2ff', label: 'Active Students', value: `${liveStats.totalStudents} Registered`, pulse: false },
        { icon: <Calendar size={18} />, color: '#00e676', label: 'Bookings Today', value: `${liveStats.totalBookingsToday} Reserved`, pulse: false },
        { icon: <CheckCircle size={18} />, color: '#ff9800', label: 'System Status', value: liveStats.status, pulse: true },
    ];

    return (
        <div className="home-root" style={{
            minHeight: '100vh',
            background: t.bg,
            color: t.text,
            fontFamily: "'Outfit', 'Inter', sans-serif",
            position: 'relative',
            overflowX: 'hidden',
            transition: 'background 0.5s ease, color 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Animated Background Orbs */}
            <div style={{
                position: 'fixed', top: '10%', left: '10%',
                width: '500px', height: '500px', borderRadius: '50%',
                background: t.orb1, filter: 'blur(120px)',
                pointerEvents: 'none', zIndex: 0,
                animation: 'orbFloat1 12s ease-in-out infinite',
            }} />
            <div style={{
                position: 'fixed', bottom: '10%', right: '5%',
                width: '450px', height: '450px', borderRadius: '50%',
                background: t.orb2, filter: 'blur(100px)',
                pointerEvents: 'none', zIndex: 0,
                animation: 'orbFloat2 15s ease-in-out infinite',
            }} />
            <div style={{
                position: 'fixed', top: '50%', right: '30%',
                width: '300px', height: '300px', borderRadius: '50%',
                background: t.orb3, filter: 'blur(80px)',
                pointerEvents: 'none', zIndex: 0,
                animation: 'orbFloat1 18s ease-in-out infinite reverse',
            }} />

            {/* Grid Background */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
                backgroundImage: `linear-gradient(${t.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${t.gridColor} 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
                maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 60%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 60%, transparent 100%)',
            }} />

            {/* ── NAVBAR ── */}
            <header className="home-header" style={{
                position: 'sticky',
                top: 0, zIndex: 100,
                background: t.navBg,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${t.navBorder}`,
                transition: 'background 0.4s ease',
            }}>
                <div className="home-nav-container" style={{
                    maxWidth: '1200px', margin: '0 auto',
                    padding: '0 2rem',
                    height: '64px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #7b61ff, #00d2ff)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(123,97,255,0.4)',
                        }}>
                            <Monitor size={20} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                IT Center
                            </div>
                            <div style={{ fontSize: '0.65rem', color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1 }}>
                                Management System
                            </div>
                        </div>
                    </div>

                    {/* Nav Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {user ? (
                            <>
                                <Link to={dashboardLink} style={{
                                    padding: '8px 18px', borderRadius: '10px',
                                    fontWeight: 700, fontSize: '0.9rem',
                                    color: '#fff', textDecoration: 'none',
                                    background: 'linear-gradient(135deg, #7b61ff, #5b3ff0)',
                                    boxShadow: '0 4px 16px rgba(123,97,255,0.35)',
                                    transition: 'all 0.2s ease',
                                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(123,97,255,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(123,97,255,0.35)'; }}
                                >
                                    <LayoutDashboard size={15} /> Dashboard
                                </Link>
                                <button onClick={handleLogoutClick} style={{
                                    padding: '8px 18px', borderRadius: '10px',
                                    fontWeight: 600, fontSize: '0.9rem',
                                    color: '#ff6b6b', textDecoration: 'none',
                                    background: 'rgba(255,107,107,0.08)',
                                    border: '1px solid rgba(255,107,107,0.2)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,107,0.08)'}
                                >
                                    <LogOut size={15} /> Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" style={{
                                    padding: '8px 18px', borderRadius: '10px',
                                    fontWeight: 600, fontSize: '0.9rem',
                                    color: t.text, textDecoration: 'none',
                                    background: t.btnSecBg,
                                    border: `1px solid ${t.btnSecBorder}`,
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                    Sign In
                                </Link>
                                <Link to="/register" style={{
                                    padding: '8px 20px', borderRadius: '10px',
                                    fontWeight: 700, fontSize: '0.9rem',
                                    color: '#fff', textDecoration: 'none',
                                    background: 'linear-gradient(135deg, #7b61ff, #5b3ff0)',
                                    boxShadow: '0 4px 16px rgba(123,97,255,0.35)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(123,97,255,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(123,97,255,0.35)'; }}
                                >
                                    Register
                                </Link>
                            </>
                        )}

                        {/* Dark / Light Toggle */}
                        <button
                            onClick={toggleTheme}
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            id="theme-toggle-btn"
                            style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: t.toggleBg,
                                border: `1px solid ${t.toggleBorder}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: t.text,
                                transition: 'all 0.3s ease',
                                flexShrink: 0,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(123,97,255,0.2)'; e.currentTarget.style.borderColor = '#7b61ff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = t.toggleBg; e.currentTarget.style.borderColor = t.toggleBorder; }}
                        >
                            {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#7b61ff" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── HERO SECTION ── */}
            <main className="home-main" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <div className="home-hero-container" style={{
                    maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem 4rem',
                    display: 'flex', alignItems: 'center', gap: '4rem',
                    flexWrap: 'wrap',
                }}>
                    {/* Left Column */}
                    <div className="home-left-col" style={{ flex: '1 1 480px', minWidth: '280px' }}>
                        {/* Badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '6px 14px', borderRadius: '100px',
                            background: 'rgba(123,97,255,0.12)',
                            border: '1px solid rgba(123,97,255,0.3)',
                            fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em',
                            color: '#7b61ff', textTransform: 'uppercase',
                            marginBottom: '1.5rem',
                        }}>
                            <Zap size={13} fill="#7b61ff" />
                            Smart PC Allocation System
                        </div>

                        {/* Heading */}
                        <h1 className="home-heading" style={{
                            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: '-0.03em',
                            marginBottom: '1.25rem',
                            color: t.text,
                        }}>
                            Maximize Your Lab{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #7b61ff 0%, #00d2ff 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                Productivity
                            </span>
                        </h1>

                        <p className="home-desc" style={{
                            fontSize: '1.05rem', lineHeight: 1.7,
                            color: t.textSub, marginBottom: '2.5rem',
                            maxWidth: '500px',
                        }}>
                            University IT Center PC Booking System. Register your student profile, reserve high-performance workstations, and manage your daily quota effortlessly.
                        </p>

                        {/* CTA Buttons */}
                        <div className="home-cta-container" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '3rem' }}>
                            <Link to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/student/book') : '/register'} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '13px 28px', borderRadius: '12px',
                                fontWeight: 700, fontSize: '0.95rem',
                                color: '#fff', textDecoration: 'none',
                                background: 'linear-gradient(135deg, #7b61ff, #00d2ff)',
                                boxShadow: '0 6px 24px rgba(123,97,255,0.4)',
                                transition: 'all 0.25s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(123,97,255,0.55)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(123,97,255,0.4)'; }}
                            >
                                {user ? 'Book a Workstation' : 'Get Started Now'} <ArrowRight size={18} />
                            </Link>
                            <Link to={dashboardLink} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '13px 28px', borderRadius: '12px',
                                fontWeight: 600, fontSize: '0.95rem',
                                color: t.btnSecText, textDecoration: 'none',
                                background: t.btnSecBg,
                                border: `1px solid ${t.btnSecBorder}`,
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                {user ? 'Go to Dashboard' : 'Member Dashboard'}
                            </Link>
                        </div>

                        {/* Feature Cards Grid */}
                        <div className="home-features-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                            gap: '12px',
                        }}>
                            {features.map((f, i) => (
                                <div key={i} style={{
                                    padding: '14px 16px',
                                    background: t.featureBg,
                                    border: `1px solid ${t.featureBorder}`,
                                    borderRadius: '14px',
                                    backdropFilter: 'blur(12px)',
                                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = t.cardBgHover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = t.featureBg; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                                        background: `${f.color}18`,
                                        border: `1px solid ${f.color}30`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: f.color,
                                    }}>
                                        {f.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '3px', color: t.text }}>{f.label}</div>
                                        <div style={{ fontSize: '0.78rem', color: t.textMuted, lineHeight: 1.4 }}>{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column – Glass Status Card */}
                    <div className="home-right-col" style={{ flex: '0 1 380px', minWidth: '280px' }}>
                        <div style={{
                            background: t.cardBg,
                            border: `1px solid ${t.cardBorder}`,
                            borderRadius: '24px',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            padding: '2rem',
                            boxShadow: isDark
                                ? '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)'
                                : '0 20px 60px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            {/* Card glow accent */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                                background: 'linear-gradient(90deg, #7b61ff, #00d2ff, #7b61ff)',
                                borderRadius: '24px 24px 0 0',
                            }} />

                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                }}>
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '12px',
                                        background: 'linear-gradient(135deg, rgba(123,97,255,0.2), rgba(0,210,255,0.2))',
                                        border: '1px solid rgba(123,97,255,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#7b61ff',
                                    }}>
                                        <Monitor size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', color: t.text }}>IT Center Status</div>
                                        <div style={{ fontSize: '0.75rem', color: t.textMuted }}>Live system overview</div>
                                    </div>
                                </div>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '100px',
                                    background: 'rgba(0,230,118,0.15)',
                                    border: '1px solid rgba(0,230,118,0.3)',
                                    fontSize: '0.72rem', fontWeight: 700,
                                    color: '#00e676', letterSpacing: '0.04em',
                                    textTransform: 'uppercase',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                }}>
                                    <span style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: '#00e676',
                                        animation: 'pulse 2s infinite',
                                        display: 'inline-block',
                                    }} />
                                    Live
                                </span>
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                                {stats.map((s, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '12px 14px',
                                        background: t.statBg,
                                        border: `1px solid ${t.statBorder}`,
                                        borderRadius: '12px',
                                        transition: 'all 0.2s',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '30px', height: '30px', borderRadius: '8px',
                                                background: `${s.color}15`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: s.color,
                                            }}>
                                                {s.icon}
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: t.textSub }}>{s.label}</span>
                                        </div>
                                        <span style={{
                                            fontSize: '0.82rem', fontWeight: 700, color: s.color,
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                        }}>
                                            {s.pulse && (
                                                <span style={{
                                                    width: '7px', height: '7px', borderRadius: '50%',
                                                    background: s.color,
                                                    display: 'inline-block',
                                                    animation: 'pulse 2s infinite',
                                                }} />
                                            )}
                                            {s.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <Link to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/student/book') : '/login'} style={{
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                                padding: '14px',
                                background: 'linear-gradient(135deg, #7b61ff, #00d2ff)',
                                borderRadius: '14px',
                                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                                textDecoration: 'none',
                                boxShadow: '0 6px 20px rgba(123,97,255,0.35)',
                                transition: 'all 0.25s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(123,97,255,0.5)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(123,97,255,0.35)'; }}
                            >
                                {user ? 'Go to Booking' : 'Log In to Book Now'} <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── FOOTER ── */}
            <footer style={{
                position: 'relative', zIndex: 1,
                borderTop: `1px solid ${t.footerBorder}`,
                background: t.footerBg,
                backdropFilter: 'blur(12px)',
                padding: '1.5rem 2rem',
                textAlign: 'center',
                fontSize: '0.82rem',
                color: t.footerText,
            }}>
                © {new Date().getFullYear()} University IT Center Management System. All rights reserved.
            </footer>

            {/* Keyframe Animations */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
                @keyframes orbFloat1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -20px) scale(1.05); }
                    66% { transform: translate(-20px, 15px) scale(0.97); }
                }
                @keyframes orbFloat2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-25px, 20px) scale(1.03); }
                    66% { transform: translate(20px, -15px) scale(0.98); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.85); }
                }
                * { box-sizing: border-box; margin: 0; padding: 0; }

                /* Mobile responsiveness */
                @media (max-width: 768px) {
                    .home-nav-container {
                        padding: 0 1.25rem !important;
                    }
                    .home-hero-container {
                        padding: 2.5rem 1.25rem 2rem !important;
                        gap: 2.5rem !important;
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                    .home-left-col {
                        flex: 1 1 auto !important;
                        text-align: center !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                    }
                    .home-right-col {
                        flex: 1 1 auto !important;
                        max-width: 100% !important;
                    }
                    .home-cta-container {
                        justify-content: center !important;
                        width: 100% !important;
                    }
                    .home-cta-container > a {
                        flex: 1 !important;
                        min-width: 180px !important;
                        justify-content: center !important;
                    }
                    .home-features-grid {
                        grid-template-columns: 1fr !important;
                        width: 100% !important;
                        text-align: left !important;
                        gap: 10px !important;
                    }
                    .home-heading {
                        font-size: 2.3rem !important;
                        margin-bottom: 1rem !important;
                    }
                    .home-desc {
                        margin-bottom: 1.75rem !important;
                    }
                }
                @media (max-width: 480px) {
                    .home-nav-container {
                        flex-direction: row !important;
                        height: 64px !important;
                        padding: 0 0.75rem !important;
                        gap: 8px !important;
                    }
                    .home-nav-container a {
                        padding: 6px 12px !important;
                        font-size: 0.8rem !important;
                    }
                    .home-root {
                        overflow-x: hidden !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;
