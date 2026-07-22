import React, { useState } from 'react';
import { Mail, Lock, User, Hash, BookOpen, Building2, UserPlus, Eye, EyeOff, Monitor, CheckCircle, GraduationCap, Phone } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';

const decodeGoogleToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding token", e);
    return null;
  }
};

// ── Faculty → Departments → Programmes ──────────────────────────────────────
const FACULTY_DATA = {
  'Faculty of Business Studies': {
    departments: [
      'Department of Business Administration',
      'Department of Accounting & Finance',
      'Department of Marketing Management',
      'Department of Human Resource Management',
    ],
    programmes: [
      'BSc (Hons) Business Administration',
      'BSc (Hons) Accounting & Finance',
      'BSc (Hons) Marketing Management',
      'BSc (Hons) Human Resource Management',
      'HND Business Studies',
    ],
  },
  'Faculty of Technological Studies': {
    departments: [
      'Department of Information & Communication Technology',
      'Department of Computer Science',
      'Department of Engineering Technology',
      'Department of Information Technology',
    ],
    programmes: [
      'BSc (Hons) Information & Communication Technology Studies (ICTS)',
      'BSc (Hons) Computer Science',
      'BSc (Hons) Engineering Technology',
      'HND Information Technology',
      'HND Computer Science',
    ],
  },
  'Faculty of Applied Sciences': {
    departments: [
      'Department of Mathematics',
      'Department of Physics',
      'Department of Chemistry',
      'Department of Biology',
      'Department of Environmental Science',
    ],
    programmes: [
      'BSc (Hons) Applied Sciences',
      'BSc (Hons) Mathematics',
      'BSc (Hons) Physics',
      'BSc (Hons) Chemistry',
      'BSc (Hons) Environmental Science',
    ],
  },
};

const Register = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isGoogleAutofilled, setIsGoogleAutofilled] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.googleEmail || location.state?.googleName) {
      setFormData(prev => ({
        ...prev,
        email: location.state.googleEmail || prev.email,
        name: location.state.googleName || prev.name
      }));
      setIsGoogleAutofilled(true);
    }
  }, [location.state]);

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = decodeGoogleToken(credentialResponse.credential);
    if (decoded) {
      setFormData(prev => ({
        ...prev,
        name: decoded.name || prev.name,
        email: decoded.email || prev.email
      }));
      setIsGoogleAutofilled(true);
      setError('');
    } else {
      setError('Failed to extract Google profile details.');
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    faculty: '',
    programme: '',
    department: '',
    year: '',
    semester: '',
    agreedToTerms: false
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  // Handle standard changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'faculty') {
      setFormData(prev => ({ ...prev, faculty: value, programme: '', department: '' }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      // Validate Step 1
      if (!formData.name || !formData.studentId || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
        setError('All fields in Step 1 are required.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      // Check password complexity (Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
      const pwdPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!pwdPattern.test(formData.password)) {
        setError('Password must be at least 8 characters long, and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
        return;
      }
      setStep(2);
      return;
    }

    // Validate Step 2
    if (!formData.faculty || !formData.department || !formData.programme || !formData.year || !formData.semester) {
      setError('All academic fields are required.');
      return;
    }
    if (!formData.agreedToTerms) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);
    try {
      // Prepare payload to match backend schema exactly
      const payload = {
        name: formData.name,
        studentId: formData.studentId,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        department: formData.department,
        degreeProgramme: formData.programme,
        academicYear: formData.year,
        semester: formData.semester,
        agreedToTerms: formData.agreedToTerms
      };

      await register(payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedFaculty = FACULTY_DATA[formData.faculty] || null;

  const selectStyle = { paddingLeft: '42px' };
  const optBg = { background: '#1a1a3a' };

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

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '520px', gap: '1.5rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
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
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            IT CENTER MANAGEMENT SYSTEM
          </p>
        </div>

        <div className="glass-panel" style={{ width: '100%', padding: '2.5rem' }}>
          {/* Step Progress */}
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
              fontSize: '0.9rem', color: '#ff8080', lineHeight: '1.4'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {step === 1 ? (
              <>
                {/* Google Autofill Button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.2rem', width: '100%', gap: '8px' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      setError('Failed to fetch Google profile. Please fill manually.');
                    }}
                    text="signup_with"
                    theme="filled_blue"
                    shape="pill"
                    size="large"
                    width="356px"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', margin: '0.4rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>or fill manually</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
                  </div>
                </div>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', zIndex: 10 }} />
                    <input type="text" name="name" className="glass-input" placeholder="John Doe" style={{ paddingLeft: '42px', opacity: isGoogleAutofilled ? 0.75 : 1 }} value={formData.name} onChange={handleChange} required id="reg-name" readOnly={isGoogleAutofilled} />
                  </div>
                </div>

                {/* Student ID */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Student ID</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', zIndex: 10 }} />
                    <input type="text" name="studentId" className="glass-input" placeholder="2021ICTS01" style={{ paddingLeft: '42px' }} value={formData.studentId} onChange={handleChange} required id="reg-studentId" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', zIndex: 10 }} />
                    <input type="email" name="email" className="glass-input" placeholder="e.g. personal@gmail.com" style={{ paddingLeft: '42px', opacity: isGoogleAutofilled ? 0.75 : 1 }} value={formData.email} onChange={handleChange} required id="reg-email" readOnly={isGoogleAutofilled} />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', zIndex: 10 }} />
                    <input type="tel" name="phone" className="glass-input" placeholder="e.g. +94771234567" style={{ paddingLeft: '42px' }} value={formData.phone} onChange={handleChange} required id="reg-phone" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', zIndex: 10 }} />
                    <input type={showPassword ? 'text' : 'password'} name="password" className="glass-input" placeholder="Min. 8 characters with Upper, Lower, Num, Special" style={{ paddingLeft: '42px', paddingRight: '42px' }} value={formData.password} onChange={handleChange} required minLength={8} id="reg-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', zIndex: 10 }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', zIndex: 10 }} />
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" className="glass-input" placeholder="Retype password" style={{ paddingLeft: '42px', paddingRight: '42px' }} value={formData.confirmPassword} onChange={handleChange} required id="reg-confirmPassword" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', zIndex: 10 }}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ── FACULTY ── */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Faculty</label>
                  <div style={{ position: 'relative' }}>
                    <GraduationCap size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', zIndex: 1 }} />
                    <select name="faculty" className="glass-input" value={formData.faculty} onChange={handleChange} required id="reg-faculty" style={selectStyle}>
                      <option value="" style={optBg}>Select faculty...</option>
                      {Object.keys(FACULTY_DATA).map(f => (
                        <option key={f} value={f} style={optBg}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── DEPARTMENT (dynamic) ── */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Department</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', zIndex: 1 }} />
                    <select
                      name="department"
                      className="glass-input"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      id="reg-department"
                      style={{
                        ...selectStyle,
                        opacity: selectedFaculty ? 1 : 0.5,
                        cursor: selectedFaculty ? 'pointer' : 'not-allowed',
                      }}
                      disabled={!selectedFaculty}
                    >
                      <option value="" style={optBg}>
                        {selectedFaculty ? 'Select department...' : 'Select a faculty first'}
                      </option>
                      {selectedFaculty?.departments.map(d => (
                        <option key={d} value={d} style={optBg}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── PROGRAMME (dynamic) ── */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Programme</label>
                  <div style={{ position: 'relative' }}>
                    <BookOpen size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', zIndex: 1 }} />
                    <select
                      name="programme"
                      className="glass-input"
                      value={formData.programme}
                      onChange={handleChange}
                      required
                      id="reg-programme"
                      style={{
                        ...selectStyle,
                        opacity: selectedFaculty ? 1 : 0.5,
                        cursor: selectedFaculty ? 'pointer' : 'not-allowed',
                      }}
                      disabled={!selectedFaculty}
                    >
                      <option value="" style={optBg}>
                        {selectedFaculty ? 'Select programme...' : 'Select a faculty first'}
                      </option>
                      {selectedFaculty?.programmes.map(p => (
                        <option key={p} value={p} style={optBg}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── YEAR OF STUDY ── */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Year of Study</label>
                  <select name="year" className="glass-input" value={formData.year} onChange={handleChange} required id="reg-year">
                    <option value="" style={optBg}>Select year...</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => (
                      <option key={y} value={y} style={optBg}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* ── SEMESTER ── */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Semester</label>
                  <select name="semester" className="glass-input" value={formData.semester} onChange={handleChange} required id="reg-semester">
                    <option value="" style={optBg}>Select semester...</option>
                    {['Semester 1', 'Semester 2'].map(s => (
                      <option key={s} value={s} style={optBg}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* ── TERMS & CONDITIONS ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    id="reg-agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                    required
                  />
                  <label htmlFor="reg-agreedToTerms" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', cursor: 'pointer' }}>
                    I agree to the Terms of Service and Privacy Policy, and understand that my account must be approved by an administrator before booking workstations.
                  </label>
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
