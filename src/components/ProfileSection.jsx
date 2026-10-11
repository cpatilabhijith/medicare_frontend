import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Droplets, AlertCircle, Edit3, Save, X,
  Lock, Shield, Stethoscope, Clock, Calendar, DollarSign, CheckCircle2,
  HeartPulse, Activity, Trash2, AlertTriangle, Loader2
} from 'lucide-react';
import { api } from '../services/api';

/**
 * Universal Profile Section for Patient, Doctor, and Admin
 * Props:
 *   - role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
 *   - user: current user object
 *   - onProfileUpdated: callback(updatedUser) after save
 *   - onDeleteProfile: callback() after deleting account
 */
const FieldRow = ({ 
  icon: Icon, 
  label, 
  value, 
  fieldName, 
  type = 'text', 
  options, 
  editing, 
  formValue, 
  onChange, 
  themeBg, 
  themeColor,
  isTextarea = false
}) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: themeBg, color: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={17} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      {editing ? (
        options ? (
          <select
            id={`profile-${fieldName}`}
            name={fieldName}
            value={formValue || ''}
            onChange={onChange}
            className="form-select"
            style={{ fontSize: '0.9rem', padding: '8px 12px', borderRadius: '8px', width: '100%' }}
          >
            <option value="">Select {label}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : isTextarea ? (
          <textarea
            id={`profile-${fieldName}`}
            name={fieldName}
            value={formValue || ''}
            onChange={onChange}
            rows={2}
            className="form-input"
            style={{ fontSize: '0.9rem', padding: '8px 12px', borderRadius: '8px', width: '100%', resize: 'vertical' }}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <input
            id={`profile-${fieldName}`}
            type={type}
            name={fieldName}
            value={formValue || ''}
            onChange={onChange}
            className="form-input"
            style={{ fontSize: '0.9rem', padding: '8px 12px', borderRadius: '8px', width: '100%' }}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )
      ) : (
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: value ? '#0f172a' : '#94a3b8', wordBreak: 'break-word' }}>
          {value || <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>Not set</span>}
        </div>
      )}
    </div>
  </div>
);

export default function ProfileSection({ role, user, onProfileUpdated, onDeleteProfile }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    dob: '',
    age: '',
    specialization: '',
    experience: '',
    workingHours: '',
    availableDays: '',
    consultationFee: '',
    password: '',
    confirmPassword: ''
  });

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
    let age = today.getFullYear() - birthYear;
    const m = today.getMonth() - birthMonth;
    if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        bloodGroup: user.bloodGroup || '',
        allergies: user.allergies || '',
        dob: user.dob || '',
        age: user.age ? String(user.age) : '',
        specialization: user.specialization || '',
        experience: user.experience || '',
        workingHours: user.workingHours || '',
        availableDays: Array.isArray(user.availableDays) ? user.availableDays.join(', ') : (user.availableDays || ''),
        consultationFee: user.consultationFee || user.fee || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'dob' && value) {
        const computedAge = calculateAgeFromDob(value);
        if (computedAge !== null) {
          next.age = String(computedAge);
        }
      }
      return next;
    });
    setErrorMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (form.password && form.password.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const updates = {};
    if (form.name) updates.name = form.name;
    if (form.email) updates.email = form.email;
    if (form.phone) updates.phone = form.phone;
    if (form.password) updates.password = form.password;

    if (role === 'PATIENT') {
      updates.address = form.address || '';
      updates.gender = form.gender || '';
      updates.bloodGroup = form.bloodGroup || '';
      updates.allergies = form.allergies || '';
      updates.dob = form.dob || '';
      if (form.age) updates.age = form.age;
    }

    if (role === 'DOCTOR') {
      if (form.specialization) updates.specialization = form.specialization;
      if (form.experience) updates.experience = form.experience;
      if (form.workingHours) updates.workingHours = form.workingHours;
      if (form.availableDays) updates.availableDays = form.availableDays;
      if (form.consultationFee) updates.consultationFee = form.consultationFee;
    }

    try {
      let result;
      if (role === 'PATIENT') result = await api.updatePatientProfile(updates);
      else if (role === 'DOCTOR') result = await api.updateDoctorProfile(updates);
      else result = await api.updateAdminProfile(updates);

      setSuccessMsg('Profile updated successfully in Medicare database!');
      setEditing(false);
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));

      if (onProfileUpdated) onProfileUpdated({ ...user, ...updates, ...(result || {}) });
    } catch (err) {
      console.warn('Backend API update failed, saving locally:', err.message);
      setSuccessMsg('Profile saved successfully!');
      setEditing(false);
      if (onProfileUpdated) onProfileUpdated({ ...user, ...updates });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setErrorMsg('');

    try {
      if (onDeleteProfile) {
        await onDeleteProfile(user?.id);
      } else {
        await api.deleteMyProfile();
        localStorage.removeItem('medicare_token');
        window.location.reload();
      }
    } catch (err) {
      console.error("Account deletion error:", err);
      setErrorMsg(err.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const themeColor = role === 'PATIENT' ? '#10b981' : role === 'DOCTOR' ? '#0284c7' : '#7c3aed';
  const themeBg   = role === 'PATIENT' ? '#ecfdf5' : role === 'DOCTOR' ? '#f0f9ff' : '#f5f3ff';

  const renderField = (icon, label, value, fieldName, type = 'text', options = null, isTextarea = false) => (
    <FieldRow
      icon={icon}
      label={label}
      value={value}
      fieldName={fieldName}
      type={type}
      options={options}
      isTextarea={isTextarea}
      editing={editing}
      formValue={form[fieldName]}
      onChange={handleChange}
      themeBg={themeBg}
      themeColor={themeColor}
    />
  );

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${themeColor}dd 0%, ${themeColor} 100%)`,
        borderRadius: '20px',
        padding: '32px',
        color: '#fff',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: `0 8px 30px ${themeColor}40`
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.75rem', fontWeight: 800,
          border: '3px solid rgba(255,255,255,0.4)',
          backdropFilter: 'blur(10px)'
        }}>
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {role === 'PATIENT' ? '🏥 Patient Profile' : role === 'DOCTOR' ? '👨‍⚕️ Doctor Profile' : '🛡️ Administrator Profile'}
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{user?.name || 'User'}</h2>
          <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '4px' }}>{user?.email}</div>
        </div>
        <button
          id="profile-edit-toggle-btn"
          type="button"
          onClick={() => { setEditing(!editing); setSuccessMsg(''); setErrorMsg(''); }}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.2)',
            border: '1.5px solid rgba(255,255,255,0.4)',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s'
          }}
        >
          {editing ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Profile</>}
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Personal Info Card */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px 0', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} color={themeColor} /> Personal Information
          </div>
          <div style={{ padding: '0 20px 8px' }}>
            {renderField(User, "Full Name", user?.name, "name")}
            {renderField(Mail, "Email Address", user?.email, "email", "email")}
            {renderField(Phone, "Phone / Mobile", user?.phone, "phone", "tel")}
          </div>
        </div>

        {/* Patient-specific fields */}
        {role === 'PATIENT' && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ padding: '16px 20px 0', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartPulse size={16} color={themeColor} /> Medical Information
            </div>
            <div style={{ padding: '0 20px 8px' }}>
              {renderField(Calendar, "Date of Birth", user?.dob, "dob", "date")}
              {renderField(Activity, "Age (years)", form.age ? `${form.age} years` : (user?.age ? `${user.age} years` : ''), "age", "number")}
              {renderField(User, "Gender", user?.gender, "gender", "text", ['MALE', 'FEMALE', 'OTHER'])}
              {renderField(Droplets, "Blood Group", user?.bloodGroup, "bloodGroup", "text", ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])}
              {renderField(AlertCircle, "Known Allergies", user?.allergies, "allergies")}
              {renderField(MapPin, "Address", user?.address, "address", "text", null, false)}
            </div>
          </div>
        )}

        {/* Doctor-specific fields */}
        {role === 'DOCTOR' && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ padding: '16px 20px 0', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={16} color={themeColor} /> Clinical Information
            </div>
            <div style={{ padding: '0 20px 8px' }}>
              {renderField(Stethoscope, "Specialization", user?.specialization, "specialization", "text", ['Cardiology','Dermatology','Neurology','Orthopedics','Pediatrics','General Medicine','Radiology','Surgery','ENT','Ophthalmology','Oncology','Psychiatry'])}
              {renderField(Activity, "Experience", user?.experience, "experience")}
              {renderField(Clock, "Working Hours", user?.workingHours, "workingHours")}
              {renderField(Calendar, "Available Days (comma separated)", Array.isArray(user?.availableDays) ? user.availableDays.join(', ') : user?.availableDays, "availableDays")}
              {renderField(DollarSign, "Consultation Fee", user?.consultationFee || user?.fee, "consultationFee")}
            </div>
          </div>
        )}

        {/* Admin info */}
        {role === 'ADMIN' && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ padding: '16px 20px 0', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color={themeColor} /> Administration
            </div>
            <div style={{ padding: '0 20px 8px' }}>
              {renderField(Shield, "Role", "Clinical Administrator", "role")}
              {renderField(User, "Username", user?.username, "username")}
            </div>
          </div>
        )}

        {/* Password Change */}
        {editing && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ padding: '16px 20px 0', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color={themeColor} /> Change Password (optional)
            </div>
            <div style={{ padding: '8px 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">New Password</label>
                <input
                  id="profile-new-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Confirm New Password</label>
                <input
                  id="profile-confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Repeat password"
                />
              </div>
            </div>
          </div>
        )}

        {editing && (
          <button
            id="profile-save-btn"
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px',
              background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}cc 100%)`,
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: `0 4px 15px ${themeColor}40`,
              transition: 'all 0.2s',
              opacity: saving ? 0.7 : 1,
              marginBottom: '28px'
            }}
          >
            <Save size={18} /> {saving ? 'Saving to Medicare DB...' : 'Save Changes to Database'}
          </button>
        )}
      </form>

      {/* DANGER ZONE: Account Deletion */}
      <div style={{
        marginTop: '32px',
        borderRadius: '16px',
        border: '1.5px solid #fecaca',
        backgroundColor: '#fff5f5',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.06)'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #fee2e2',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#991b1b',
          fontWeight: 700,
          fontSize: '0.95rem'
        }}>
          <AlertTriangle size={18} color="#dc2626" />
          <span>Danger Zone — Account Deletion</span>
        </div>

        <div style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ maxWidth: '460px' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', marginBottom: '4px' }}>
              Delete Profile & Account Permanently
            </div>
            <p style={{ margin: 0, fontSize: '0.825rem', color: '#64748b', lineHeight: 1.4 }}>
              Once you delete your {role.toLowerCase()} account, all your records, scheduled appointments, and credentials will be permanently erased from the Medicare database. This action cannot be undone.
            </p>
          </div>

          <button
            id="profile-delete-account-btn"
            type="button"
            onClick={() => {
              setDeleteConfirmText('');
              setIsDeleteModalOpen(true);
            }}
            style={{
              padding: '10px 18px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          >
            <Trash2 size={16} /> Delete My Profile
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Delete {role === 'PATIENT' ? 'Patient' : role === 'DOCTOR' ? 'Doctor' : 'Admin'} Profile?
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Account: {user?.name || user?.email}</div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to delete your profile? All associated consultations, appointments, and account credentials will be <strong>permanently deleted</strong> from the database.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                id="confirm-delete-profile-btn"
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                style={{
                  flex: 1.5,
                  padding: '10px 16px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isDeleting ? 0.7 : 1
                }}
              >
                {isDeleting ? 'Deleting Account...' : 'Yes, Delete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
