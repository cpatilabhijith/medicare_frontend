import React, { useState } from 'react';
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, Plus, Search, Shield, CheckCircle, XCircle, User } from 'lucide-react';
import ProfileSection from './ProfileSection';

export default function AdminDashboard({ 
  doctors, 
  patients, 
  appointments, 
  onAddDoctor, 
  onUpdateAppointmentStatus, 
  onDeleteDoctor, 
  onDeletePatient, 
  onDeleteAppointment, 
  adminUser, 
  onUpdateAdmin,
  onDeleteAdmin,
  activeTab: controlledTab,
  onTabChange
}) {
  const [internalTab, setInternalTab] = useState('overview'); // 'overview' | 'doctors' | 'patients' | 'appointments' | 'profile'
  const activeTab = onTabChange && controlledTab !== undefined ? controlledTab : internalTab;
  const setActiveTab = onTabChange || setInternalTab;
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);

  // New Doctor Form State
  const [docName, setDocName] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('Cardiology');
  const [docFee, setDocFee] = useState('$120');
  const [docExperience, setDocExperience] = useState('10 years');
  const [docDays, setDocDays] = useState('Monday, Wednesday, Friday');
  const [docHours, setDocHours] = useState('09:00 AM - 04:00 PM');
  const [docPhone, setDocPhone] = useState('+1 (555) 000-1122');
  const [docEmail, setDocEmail] = useState('');

  // Calculations for KPI Cards
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED').length;
  const pendingAppointments = appointments.filter(a => a.status === 'PENDING').length;
  const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;
  const estimatedRevenue = completedAppointments * 125;

  const handleCreateDoctor = (e) => {
    e.preventDefault();
    const newDoc = {
      name: docName.startsWith('Dr.') ? docName : `Dr. ${docName}`,
      specialization: docSpecialization,
      experience: docExperience,
      consultationFee: docFee.startsWith('$') ? docFee : `$${docFee}`,
      phone: docPhone,
      email: docEmail || `${docName.toLowerCase().replace(/[^a-z]/g, '')}@medicare.com`,
      availableDays: docDays,
      workingHours: docHours
    };

    onAddDoctor(newDoc);
    setIsAddDoctorOpen(false);
    setDocName('');
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Admin Title & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={24} color="#7c3aed" />
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>Administration Control Center</h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Monitor clinic capacity, doctor availability, patient profiles, and scheduling analytics.</p>
        </div>

        <button
          onClick={() => setIsAddDoctorOpen(true)}
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}
        >
          <Plus size={16} /> Register New Doctor
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TOTAL PATIENTS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{patients.length}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>ACTIVE DOCTORS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{doctors.length}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>APPOINTMENTS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{totalAppointments}</div>
            <div style={{ fontSize: '0.75rem', color: '#b45309' }}>{pendingAppointments} pending</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ede9fe', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>COMPLETION RATE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{completionRate}%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px', paddingBottom: '10px' }}>
        {[
          { id: 'overview', label: 'All Appointments Master View' },
          { id: 'doctors', label: `Doctors Directory (${doctors.length})` },
          { id: 'patients', label: `Patients Records (${patients.length})` },
          { id: 'profile', label: '👤 My Profile' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              backgroundColor: activeTab === tab.id ? '#7c3aed' : '#f1f5f9',
              color: activeTab === tab.id ? '#ffffff' : '#64748b'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: All Appointments Master Table */}
      {activeTab === 'overview' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Clinic Appointments Master Log</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing all patient bookings</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: '#64748b' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Booking ID</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Patient</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Doctor</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Schedule</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Reason</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#475569' }}>{apt.id}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0f172a' }}>{apt.patientName}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{apt.doctorName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{apt.doctorSpecialization}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{apt.date}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>{apt.time}</div>
                    </td>
                    <td style={{ padding: '16px 20px', maxWidth: '200px', color: '#475569' }}>{apt.reason}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge badge-${apt.status.toLowerCase()}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {apt.status !== 'CONFIRMED' && apt.status !== 'COMPLETED' && (
                          <button
                            onClick={() => onUpdateAppointmentStatus(apt.id, 'CONFIRMED')}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none' }}
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                          <button
                            onClick={() => onUpdateAppointmentStatus(apt.id, 'CANCELLED')}
                            className="btn btn-danger-outline btn-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Doctors Directory */}
      {activeTab === 'doctors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {doctors.map(doc => (
            <div key={doc.id} className="card">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <img 
                  src={doc.avatar} 
                  alt={doc.name} 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=7c3aed&color=fff&size=120`;
                  }}
                  style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} 
                />
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{doc.name}</h4>
                  <span className="badge badge-confirmed">{doc.specialization}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Email:</strong> {doc.email}</div>
                <div><strong>Phone:</strong> {doc.phone}</div>
                <div><strong>Consultation Fee:</strong> {doc.consultationFee || doc.fee}</div>
                <div><strong>Working Hours:</strong> {doc.workingHours}</div>
                <div><strong>Available Days:</strong> {Array.isArray(doc.availableDays) ? doc.availableDays.join(', ') : doc.availableDays}</div>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => onDeleteDoctor && onDeleteDoctor(doc.id)}
                  className="btn btn-danger-outline btn-sm"
                  style={{ width: '100%' }}
                >
                  Delete Doctor Record (MySQL)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Patient Records */}
      {activeTab === 'patients' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: '#64748b' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Patient Name</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Age / Gender</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Blood Group</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Known Allergies</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Contact Info</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Address</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0f172a' }}>{p.name}</td>
                    <td style={{ padding: '16px 20px', color: '#475569' }}>{p.age} yrs / {p.gender}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: p.allergies !== 'None' ? '#b91c1c' : '#047857', fontWeight: 600 }}>{p.allergies}</td>
                    <td style={{ padding: '16px 20px', color: '#475569' }}>
                      <div>{p.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{p.address}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <button
                        onClick={() => onDeletePatient && onDeletePatient(p.id)}
                        className="btn btn-danger-outline btn-sm"
                      >
                        Delete Patient
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {isAddDoctorOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>Register New Doctor</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>Add medical specialist profile and initial working availability.</p>

            <form onSubmit={handleCreateDoctor}>
              <div className="form-group">
                <label className="form-label">Doctor Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="form-input"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <select
                    className="form-select"
                    value={docSpecialization}
                    onChange={(e) => setDocSpecialization(e.target.value)}
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Consultation Fee</label>
                  <input
                    type="text"
                    className="form-input"
                    value={docFee}
                    onChange={(e) => setDocFee(e.target.value)}
                    placeholder="$120"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Working Hours</label>
                  <input
                    type="text"
                    className="form-input"
                    value={docHours}
                    onChange={(e) => setDocHours(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <input
                    type="text"
                    className="form-input"
                    value={docExperience}
                    onChange={(e) => setDocExperience(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Available Days (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={docDays}
                  onChange={(e) => setDocDays(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddDoctorOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, background: '#7c3aed' }}
                >
                  Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Admin Profile Tab */}
      {activeTab === 'profile' && (
        <ProfileSection
          role="ADMIN"
          user={adminUser || { name: 'Administrator', email: 'admin@medicare.com', username: 'admin', role: 'ADMIN' }}
          onProfileUpdated={(updated) => {
            if (onUpdateAdmin) onUpdateAdmin(updated);
          }}
          onDeleteProfile={() => {
            if (onDeleteAdmin) onDeleteAdmin();
          }}
        />
      )}
    </div>
  );
}
