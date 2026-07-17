import React, { useState } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff, Monitor } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      if (data.role === 'admin') navigate('/admin/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="bg-blob-1"></div>
      <div className="bg-blob-2"></div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '420px', gap: '1.5rem' }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #7b61ff, #00d2ff)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 24px rgba(123, 97, 255, 0.4)'
          }}>
            <Monitor size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            IT CENTER MANAGEMENT SYSTEM
          </h1>
        </div>

        <div className="glass-panel" style={{ width: '100%', padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.4rem' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Sign in to reserve your workstation
          </p>

          {error && (
            <div style={{
              background: 'rgba(255,75,75,0.15)',
              border: '1px solid rgba(255,75,75,0.4)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              color: '#ff8080'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                <input
                  type="email"
                  className="glass-input"
                  placeholder="your@university.edu"
                  style={{ paddingLeft: '42px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="login-email"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="glass-input"
                  placeholder="••••••••"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="glass-button"
              id="login-submit"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '14px', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600' }}>
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
