import React, { useState } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff, Monitor } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import API from '../utils/api';

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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      
      const res = await API.post('/auth/google-login', { token: credentialResponse.credential });
      
      if (res.data.success) {
        login(res.data);
        if (res.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err.response?.status === 404 && err.response?.data?.email) {
        setError('Account not registered. Redirecting to complete registration...');
        setTimeout(() => {
          navigate('/register', { 
            state: { 
              googleEmail: err.response.data.email, 
              googleName: err.response.data.name 
            } 
          });
        }, 1500);
      } else {
        setError(err.response?.data?.message || 'Google login failed.');
      }
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
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', zIndex: 10 }} />
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
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', zIndex: 10 }} />
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
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', zIndex: 10 }}
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

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1.2rem 0 0.8rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
          </div>

          {/* Google Login Button */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google authentication failed. Please try again.');
              }}
              theme="filled_blue"
              shape="pill"
              size="large"
              width="372px"
            />
          </div>

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
