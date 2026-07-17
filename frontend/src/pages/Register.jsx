import React, { useState } from 'react';
import { Mail, Lock, User, Hash, BookOpen, Building2, UserPlus, Eye, EyeOff, Monitor, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '', studentId: '', email: '', password: '',
    programme: '', department: '', year: ''
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    setError('');
    try {
      await register(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="bg-blob-1" style={{ background: '#00b09b' }}></div>
        <div className="bg-blob-2" style={{ background: '#96c93d' }}></div>
        <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '3rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <CheckCircle size={64} color="#00e676" style={{ margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '1rem' }}>Registration Successful!</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Your account has been submitted for review. Please check your email to verify your account. 
            An administrator will approve your account shortly.
          </p>
          <button className="glass-button" onClick={() => navigate('/login')} style={{ width: '100%' }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="bg-blob-1" style={{ background: '#2b113f' }}></div>
      <div className="bg-blob-2" style={{ background: '#1a1a3a' }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '460px', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #7b61ff, #00d2ff)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem',
            boxShadow: '0 8px 24px rgba(123, 97, 255, 0.4)'
          }}>
            <Monitor size={28} color="#fff" />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            IT CENTER MANAGEMENT SYSTEM
          </p>
        </div>

        <div className="glass-panel" style={{ width: '100%', padding: '2.5rem' }}>
          {/* Step Indicators */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
            {[1, 2].map((s) => (
              <div key={s} style={{
                flex: 1, height: '4px', borderRadius: '4px',
                background: step >= s ? 'var(--accent-color)' : 'rgba(255,255,255,0.15)',
                transition: 'background 0.3s ease'
              }} />
            ))}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.3rem' }}>
            {step === 1 ? 'Create your account' : 'Academic details'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.8rem' }}>
            {step === 1 ? 'Step 1 of 2 — Personal information' : 'Step 2 of 2 — Academic information'}
          </p>

          {error && (
            <div style={{
              background: 'rgba(255,75,75,0.15)', border: '1px solid rgba(255,75,75,0.4)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '1.5rem',
              fontSize: '0.9rem', color: '#ff8080'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {step === 1 ? (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                    <input type="text" name="name" className="glass-input" placeholder="John Doe" style={{ paddingLeft: '42px' }} value={formData.name} onChange={handleChange} required id="reg-name" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Student ID</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                    <input type="text" name="studentId" className="glass-input" placeholder="2021ICTS01" style={{ paddingLeft: '42px' }} value={formData.studentId} onChange={handleChange} required id="reg-studentId" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                    <input type="email" name="email" className="glass-input" placeholder="student@university.edu" style={{ paddingLeft: '42px' }} value={formData.email} onChange={handleChange} required id="reg-email" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                    <input type={showPassword ? 'text' : 'password'} name="password" className="glass-input" placeholder="Min. 8 characters" style={{ paddingLeft: '42px', paddingRight: '42px' }} value={formData.password} onChange={handleChange} required minLength={8} id="reg-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Programme</label>
                  <div style={{ position: 'relative' }}>
                    <BookOpen size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                    <input type="text" name="programme" className="glass-input" placeholder="e.g. BSc ICTS" style={{ paddingLeft: '42px' }} value={formData.programme} onChange={handleChange} required id="reg-programme" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Department</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                    <input type="text" name="department" className="glass-input" placeholder="e.g. Information Technology" style={{ paddingLeft: '42px' }} value={formData.department} onChange={handleChange} id="reg-department" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Year of Study</label>
                  <select name="year" className="glass-input" value={formData.year} onChange={handleChange} required id="reg-year">
                    <option value="" style={{ background: '#1a1a3a' }}>Select year...</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => (
                      <option key={y} value={y} style={{ background: '#1a1a3a' }}>{y}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              {step === 2 && (
                <button type="button" className="glass-button secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
                  Back
                </button>
              )}
              <button type="submit" className="glass-button" id="reg-submit" disabled={loading} style={{ flex: 1, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Registering...' : step === 1 ? 'Continue →' : <><UserPlus size={18} /> Register</>}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
