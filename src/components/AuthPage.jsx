import React, { useState } from 'react';
import {
  HeartPulse, Stethoscope, User, Shield, Lock, Mail, Phone, Calendar,
  UserPlus, LogIn, CheckCircle2, ArrowRight, Eye, EyeOff, AlertCircle, Activity, Award
} from 'lucide-react';
import { api } from '../services/api';

export default function AuthPage({
  initialRole = 'PATIENT',
  onLoginSuccess,
  doctors = [],
  patients = []
}) {
  const [activeTab, setActiveTab] = useState(initialRole); // 'PATIENT' | 'DOCTOR' | 'ADMIN'
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    age: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    allergies: 'None',
    address: '',
    specialization: 'Cardiology',
    experience: '5+ years',
    workingHours: '09:00 AM - 05:00 PM',
    availableDays: 'Monday, Wednesday, Friday',
    consultationFee: '$100',
    licenseNumber: '',
    department: 'General Medicine'
  });

  // Accurate age calculation from date of birth (YYYY-MM-DD)
  const calculateAgeFromDob = (dobString) => {
    if (!dobString) return null;
    const parts = dobString.split('-');
    if (parts.length !== 3) return null;
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10) - 1;
    const birthDay = parseInt(parts[2], 10);
    const birthDate = new Date(birthYear, birthMonth, birthDay);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let calculated = today.getFullYear() - birthYear;
    const m = today.getMonth() - birthMonth;
    if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
      calculated--;
    }
    return calculated >= 0 ? calculated : 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'dob' && value) {
        const computed = calculateAgeFromDob(value);
        if (computed !== null) {
          next.age = String(computed);
        }
      }
      return next;
    });
    setError('');
  };

  const handleTabChange = (role) => {
    setActiveTab(role);
    setIsRegistering(false);
    setError('');
    setSuccessMsg('');
  };

  const handleQuickDemoLogin = (role, entity) => {
    setError('');
    if (role === 'PATIENT') {
      const patient = entity || patients[0];
      onLoginSuccess({
        role: 'PATIENT',
        user: patient,
        token: 'demo-jwt-patient-token'
      });
    } else if (role === 'DOCTOR') {
      const doctor = entity || doctors[0];
      onLoginSuccess({
        role: 'DOCTOR',
        user: doctor,
        token: 'demo-jwt-doctor-token'
      });
    } else {
      onLoginSuccess({
        role: 'ADMIN',
        user: { name: 'Dr. Arthur Vance (Director)', email: 'admin@medicare.com', role: 'ADMIN' },
        token: 'demo-jwt-admin-token'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isRegistering) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all mandatory fields (Name, Email, and Password).');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      const cleanEmail = formData.email.trim().toLowerCase();
      const generatedUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '');

      try {
        const computedAge = formData.dob
          ? calculateAgeFromDob(formData.dob)
          : (formData.age ? parseInt(formData.age, 10) : 25);

        const feeFormatted = formData.consultationFee
          ? (formData.consultationFee.startsWith('$') ? formData.consultationFee : `$${formData.consultationFee}`)
          : '$100';

        const payload = {
          username: generatedUsername.length >= 3 ? generatedUsername : `${generatedUsername}user`,
          password: formData.password,
          email: cleanEmail,
          name: formData.name,
          role: activeTab,
          phone: formData.phone || '+1 (555) 000-0000',
          specialization: formData.specialization || 'General Medicine',
          experience: formData.experience || '5+ years',
          availableDays: formData.availableDays || 'Monday, Wednesday, Friday',
          workingHours: formData.workingHours || '09:00 AM - 05:00 PM',
          consultationFee: feeFormatted,
          dob: formData.dob || null,
          age: (computedAge !== null && !isNaN(computedAge)) ? computedAge : 25,
          gender: formData.gender || 'MALE',
          bloodGroup: formData.bloodGroup || 'O+',
          allergies: formData.allergies || 'None',
          address: formData.address || 'Medicare Community Care'
        };

        const res = await api.register(payload);
        setSuccessMsg(`${activeTab === 'DOCTOR' ? 'Doctor' : activeTab === 'PATIENT' ? 'Patient' : 'Admin'} account created successfully! Authenticating...`);

        // Log in after successful registration
        setTimeout(async () => {
          try {
            const loginRes = await api.login(cleanEmail, formData.password);
            localStorage.setItem('medicare_token', loginRes.token);
            onLoginSuccess({
              role: loginRes.role,
              user: {
                id: loginRes.userId,
                name: loginRes.name,
                email: loginRes.email,
                username: loginRes.username,
                role: loginRes.role
              },
              token: loginRes.token
            });
          } catch (loginErr) {
            // Fallback user object
            onLoginSuccess({
              role: activeTab,
              user: { name: formData.name, email: cleanEmail, role: activeTab },
              token: 'registered-jwt-token'
            });
          }
        }, 500);
      } catch (err) {
        setError(err.message || 'Error creating account in Medicare Database.');
      }
    } else {
      if (!formData.email || !formData.password) {
        setError('Please enter both your email address/username and password.');
        return;
      }

      const cleanEmail = formData.email.trim().toLowerCase();

      try {
        const loginRes = await api.login(cleanEmail, formData.password);
        localStorage.setItem('medicare_token', loginRes.token);
        onLoginSuccess({
          role: loginRes.role,
          user: {
            id: loginRes.userId,
            name: loginRes.name,
            email: loginRes.email,
            username: loginRes.username,
            role: loginRes.role
          },
          token: loginRes.token
        });
      } catch (err) {
        // Fallback for pre-existing UI mock accounts if user is running frontend standalone
        if (activeTab === 'PATIENT') {
          const found = patients.find(p => (p.email && p.email.toLowerCase() === cleanEmail) || (p.name && p.name.toLowerCase() === cleanEmail));
          if (found) {
            onLoginSuccess({ role: 'PATIENT', user: found, token: 'demo-jwt-patient-token' });
            return;
          }
        } else if (activeTab === 'DOCTOR') {
          const found = doctors.find(d => (d.email && d.email.toLowerCase() === cleanEmail) || (d.name && d.name.toLowerCase() === cleanEmail));
          if (found) {
            onLoginSuccess({ role: 'DOCTOR', user: found, token: 'demo-jwt-doctor-token' });
            return;
          }
        } else if (activeTab === 'ADMIN') {
          onLoginSuccess({
            role: 'ADMIN',
            user: { name: 'Dr. Arthur Vance (Director)', email: formData.email, role: 'ADMIN' },
            token: 'demo-jwt-admin-token'
          });
          return;
        }
        setError(err.message || 'Invalid credentials or user not found in database.');
      }
    }
  };

  const getPortalTheme = () => {
    switch (activeTab) {
      case 'PATIENT':
        return {
          primary: '#10b981',
          primaryDark: '#047857',
          bgLight: '#ecfdf5',
          tag: 'Patient Care Portal',
          accentGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          badgeText: 'PATIENT ACCESS',
          badgeBg: '#d1fae5',
          badgeColor: '#065f46'
        };
      case 'DOCTOR':
        return {
          primary: '#0284c7',
          primaryDark: '#0369a1',
          bgLight: '#f0f9ff',
          tag: 'Doctor & Clinical Portal',
          accentGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          badgeText: 'SPECIALIST & PHYSICIAN',
          badgeBg: '#e0f2fe',
          badgeColor: '#075985'
        };
      case 'ADMIN':
        return {
          primary: '#7c3aed',
          primaryDark: '#6d28d9',
          bgLight: '#f5f3ff',
          tag: 'Administrative Command',
          accentGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          badgeText: 'CLINICAL DIRECTOR',
          badgeBg: '#ede9fe',
          badgeColor: '#5b21b6'
        };
      default:
        return {
          primary: '#10b981',
          primaryDark: '#047857',
          bgLight: '#ecfdf5',
          tag: 'Portal',
          accentGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        };
    }
  };

  const theme = getPortalTheme();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '32px 16px',
      position: 'relative',
      backgroundImage: 'radial-gradient(#e2e8f0 1.2px, transparent 1.2px), radial-gradient(#e2e8f0 1.2px, #f8fafc 1.2px)',
      backgroundSize: '48px 48px',
      backgroundPosition: '0 0, 24px 24px'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#ffffff',
          padding: '10px 20px',
          borderRadius: '9999px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <HeartPulse size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            MediCare <span style={{ color: '#10b981' }}>Connect</span>
          </span>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '460px', margin: '0 auto' }}>
          Clinic Appointment & Comprehensive Patient Health Records Management System
        </p>
      </div>

      {/* Main Container */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}>
        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          backgroundColor: '#f1f5f9',
          padding: '6px',
          gap: '4px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <button
            type="button"
            onClick={() => handleTabChange('PATIENT')}
            style={{
              padding: '10px 8px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: activeTab === 'PATIENT' ? '#ffffff' : 'transparent',
              color: activeTab === 'PATIENT' ? '#047857' : '#64748b',
              boxShadow: activeTab === 'PATIENT' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <User size={18} />
            <span>Patient Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('DOCTOR')}
            style={{
              padding: '10px 8px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: activeTab === 'DOCTOR' ? '#ffffff' : 'transparent',
              color: activeTab === 'DOCTOR' ? '#0369a1' : '#64748b',
              boxShadow: activeTab === 'DOCTOR' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Stethoscope size={18} />
            <span>Doctor Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('ADMIN')}
            style={{
              padding: '10px 8px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: activeTab === 'ADMIN' ? '#ffffff' : 'transparent',
              color: activeTab === 'ADMIN' ? '#6d28d9' : '#64748b',
              boxShadow: activeTab === 'ADMIN' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Shield size={18} />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Portal Header Accent */}
        <div style={{
          padding: '24px 28px 16px 28px',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: theme.bgLight
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              backgroundColor: theme.badgeBg,
              color: theme.badgeColor,
              padding: '4px 10px',
              borderRadius: '9999px'
            }}>
              {theme.badgeText}
            </span>

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccessMsg('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.primaryDark,
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isRegistering ? (
                <>Already registered? <span style={{ textDecoration: 'underline' }}>Log In</span></>
              ) : (
                <>New here? <span style={{ textDecoration: 'underline' }}>Create Account</span></>
              )}
            </button>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            {isRegistering
              ? (activeTab === 'PATIENT' ? 'Register New Patient' : (activeTab === 'DOCTOR' ? 'Register Specialist Doctor' : 'Register Clinic Admin'))
              : (activeTab === 'PATIENT' ? 'Patient Sign In' : (activeTab === 'DOCTOR' ? 'Doctor Clinical Sign In' : 'Clinic Director Sign In'))}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {activeTab === 'PATIENT' && !isRegistering && 'Access your appointments, medical records, and doctor consultations.'}
            {activeTab === 'PATIENT' && isRegistering && 'Create your health account to book appointments and track visits.'}
            {activeTab === 'DOCTOR' && !isRegistering && 'Access your patient queue, daily schedule, and update consultations.'}
            {activeTab === 'DOCTOR' && isRegistering && 'Join our practitioner network and manage patient appointments.'}
            {activeTab === 'ADMIN' && !isRegistering && 'Manage clinic doctors, patients, appointment records, and analytics.'}
            {activeTab === 'ADMIN' && isRegistering && 'Register a new Administrator account to manage the Medicare platform.'}
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Full Name for Registration */}
            {isRegistering && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  {activeTab === 'DOCTOR' ? 'Doctor Full Name (e.g. Dr. Jane Smith)' : 'Full Legal Name'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={activeTab === 'DOCTOR' ? 'Dr. Sarah Jenkins' : 'Alex Morgan'}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                {activeTab === 'DOCTOR' ? 'Medical / Clinic Email' : 'Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={
                    activeTab === 'PATIENT' ? 'alex.morgan@email.com' :
                      activeTab === 'DOCTOR' ? 'sarah.jenkins@medicare.com' : 'admin@medicare.com'
                  }
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            {/* Doctor Specific Fields on Registration */}
            {isRegistering && activeTab === 'DOCTOR' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Specialization</label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Surgery">Surgery</option>
                      <option value="ENT">ENT Specialist</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="Oncology">Oncology</option>
                      <option value="Psychiatry">Psychiatry</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 234-5678"
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Experience</label>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g. 8+ years"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Consultation Fee</label>
                    <input
                      type="text"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleInputChange}
                      placeholder="e.g. $120"
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Working Hours</label>
                    <input
                      type="text"
                      name="workingHours"
                      value={formData.workingHours}
                      onChange={handleInputChange}
                      placeholder="09:00 AM - 05:00 PM"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Available Days</label>
                    <input
                      type="text"
                      name="availableDays"
                      value={formData.availableDays}
                      onChange={handleInputChange}
                      placeholder="Monday, Wednesday, Friday"
                      className="form-input"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Patient Specific Fields on Registration */}
            {isRegistering && activeTab === 'PATIENT' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label" style={{ marginBottom: '4px' }}>Date of Birth</label>
                      {formData.age && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '1px 8px', borderRadius: '12px' }}>
                          Age: {formData.age} yrs
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ marginBottom: '4px' }}>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ marginBottom: '4px' }}>Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ marginBottom: '4px' }}>Phone / Mobile</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 345-6789"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ marginBottom: '4px' }}>Residential Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. 742 Evergreen Terrace, Springfield"
                    className="form-input"
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                {!isRegistering && (
                  <span style={{ fontSize: '0.75rem', color: theme.primaryDark, cursor: 'pointer', fontWeight: 600 }}>
                    Forgot password?
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                background: theme.accentGradient,
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `0 4px 14px ${theme.primary}40`,
                transition: 'all 0.2s ease'
              }}
            >
              {isRegistering ? (
                <>
                  <UserPlus size={18} /> Create {activeTab === 'DOCTOR' ? 'Doctor' : 'Patient'} Account
                </>
              ) : (
                <>
                  <LogIn size={18} /> Sign In to {activeTab === 'PATIENT' ? 'Patient Portal' : activeTab === 'DOCTOR' ? 'Doctor Console' : 'Admin Console'}
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#94a3b8',
              marginBottom: '12px'
            }}>
              ⚡ Quick Instant Demo Login
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeTab === 'PATIENT' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('PATIENT', patients[0])}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                        AM
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div>Alex Morgan (Patient)</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>alex.morgan@email.com</div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#10b981" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('PATIENT', patients[1])}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                        DJ
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div>David Johnson (Patient)</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>david.j@email.com</div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#10b981" />
                  </button>
                </>
              )}

              {activeTab === 'DOCTOR' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('DOCTOR', doctors[0])}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                        SJ
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div>Dr. Sarah Jenkins</div>
                        <div style={{ fontSize: '0.7rem', color: '#0284c7' }}>Cardiology Specialist</div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#0284c7" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('DOCTOR', doctors[1])}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                        MV
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div>Dr. Marcus Vance</div>
                        <div style={{ fontSize: '0.7rem', color: '#0284c7' }}>Dermatology Specialist</div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#0284c7" />
                  </button>
                </>
              )}

              {activeTab === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ADMIN', null)}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ede9fe', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                      AD
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div>Admin (Clinical Director)</div>
                      <div style={{ fontSize: '0.7rem', color: '#7c3aed' }}>Full Hospital Control Access</div>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#7c3aed" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security and Trust Footer info */}
      <div style={{
        marginTop: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        color: '#94a3b8',
        fontSize: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Shield size={14} /> EASYFAST BOOKING
        </div>
        <div>•</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Lock size={14} /> CERTIFIED DOCTORS
        </div>
        <div>•</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={14} /> 24/7 Clinic Uptime
        </div>
      </div>
    </div>
  );
}
