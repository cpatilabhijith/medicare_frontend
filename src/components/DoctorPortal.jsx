import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, XCircle, FileText, User, Settings, Save, 
  AlertCircle, Users, ChevronDown, Check, ArrowLeftRight
} from 'lucide-react';
import ProfileSection from './ProfileSection';

export default function DoctorPortal({ 
  activeDoctor, 
  doctors = [],
  onSwitchDoctor,
  appointments = [], 
  onUpdateStatus, 
  onUpdateSchedule,
  onDeleteDoctor,
  activeTab = 'appointments',
  onTabChange
}) {
  const [filter, setFilter] = useState('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isSwitchDoctorModalOpen, setIsSwitchDoctorModalOpen] = useState(false);
  const [localShowProfile, setLocalShowProfile] = useState(false);
  const isProfileActive = activeTab === 'profile' || localShowProfile;
  const [workingHours, setWorkingHours] = useState(activeDoctor?.workingHours || '');
  const [availableDays, setAvailableDays] = useState(
    Array.isArray(activeDoctor?.availableDays) 
      ? activeDoctor.availableDays.join(', ') 
      : (activeDoctor?.availableDays || 'Monday, Wednesday, Friday')
  );

  // Sync inputs when activeDoctor changes
  useEffect(() => {
    setWorkingHours(activeDoctor?.workingHours || '');
    setAvailableDays(
      Array.isArray(activeDoctor?.availableDays) 
        ? activeDoctor.availableDays.join(', ') 
        : (activeDoctor?.availableDays || 'Monday, Wednesday, Friday')
    );
  }, [activeDoctor]);

  // Filter appointments for this doctor (handles string/number IDs and nested doctor object)
  const doctorAppointments = appointments.filter(a => {
    const docId = a.doctorId !== undefined ? a.doctorId : a.doctor?.id;
    return activeDoctor?.id != null && String(docId) === String(activeDoctor.id);
  });

  const filteredAppointments = doctorAppointments.filter(apt => {
    if (filter === 'ALL') return true;
    return apt.status === filter;
  });

  const handleOpenCompleteModal = (apt) => {
    setSelectedAppointment(apt);
    setConsultationNotes(apt.notes || '');
  };

  const handleSaveNotesAndComplete = (e) => {
    e.preventDefault();
    onUpdateStatus(selectedAppointment.id, 'COMPLETED', consultationNotes);
    setSelectedAppointment(null);
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    onUpdateSchedule(activeDoctor.id, {
      workingHours,
      availableDays: availableDays.split(',').map(d => d.trim()).filter(Boolean)
    });
    setIsEditingSchedule(false);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Doctor Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        color: '#ffffff',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <img
            src={activeDoctor.avatar || activeDoctor.image}
            alt={activeDoctor.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeDoctor.name)}&background=0284c7&color=fff&size=160`;
            }}
            style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '2px solid #0284c7' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-confirmed" style={{ background: '#0284c7', color: '#ffffff' }}>
                {activeDoctor.specialization}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Doctor ID: DOC-00{activeDoctor.id}</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{activeDoctor.name}</h2>
            <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={15} color="#38bdf8" /> {activeDoctor.workingHours}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={15} color="#34d399" /> {Array.isArray(activeDoctor?.availableDays) ? activeDoctor.availableDays.join(', ') : (activeDoctor?.availableDays || 'Monday, Wednesday, Friday')}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                ⭐ {activeDoctor?.rating || '4.9'} Rating
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Switch Doctor + Manage Schedule */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Switch Doctor Account Button */}
          <button
            onClick={() => setIsSwitchDoctorModalOpen(true)}
            className="btn"
            style={{ 
              backgroundColor: '#0284c7', 
              color: '#ffffff', 
              border: 'none',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}
          >
            <ArrowLeftRight size={16} /> Switch Doctor Account
          </button>

          <button
            onClick={() => setIsEditingSchedule(!isEditingSchedule)}
            className="btn btn-secondary"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <Settings size={16} /> Manage Schedule
          </button>
          <button
            onClick={() => {
              if (onTabChange) {
                onTabChange(isProfileActive ? 'appointments' : 'profile');
              }
              setLocalShowProfile(!isProfileActive);
            }}
            className="btn btn-secondary"
            style={{ backgroundColor: isProfileActive ? '#0284c7' : 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <User size={16} /> {isProfileActive ? 'Hide Profile' : 'My Profile'}
          </button>
        </div>
      </div>

      {/* Switch Doctor Account Modal */}
      {isSwitchDoctorModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={22} color="#0284c7" /> Switch Doctor Account
              </h3>
              <button 
                onClick={() => setIsSwitchDoctorModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Select a registered practitioner to switch your active clinical workspace and view their schedule:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
              {doctors.map(doc => {
                const isCurrent = doc.id === activeDoctor.id;
                const docAptCount = appointments.filter(a => a.doctorId === doc.id).length;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (onSwitchDoctor) onSwitchDoctor(doc);
                      setIsSwitchDoctorModalOpen(false);
                    }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: `2px solid ${isCurrent ? '#0284c7' : '#e2e8f0'}`,
                      backgroundColor: isCurrent ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={doc.avatar || doc.image}
                        alt={doc.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0284c7&color=fff&size=100`;
                        }}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: `1.5px solid ${isCurrent ? '#0284c7' : '#cbd5e1'}`
                        }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                            {doc.name}
                          </span>
                          {isCurrent && (
                            <span style={{ 
                              fontSize: '0.7rem', 
                              backgroundColor: '#0284c7', 
                              color: '#ffffff', 
                              padding: '2px 8px', 
                              borderRadius: '9999px',
                              fontWeight: 700
                            }}>
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                          {doc.specialization} • Fee: {doc.consultationFee || doc.fee || '$100'}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>
                          {doc.workingHours} ({Array.isArray(doc.availableDays) ? doc.availableDays.slice(0, 2).join(', ') : (doc.availableDays || '')}...)
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: '#e2e8f0',
                        color: '#334155',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>
                        {docAptCount} Appointments
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsSwitchDoctorModalOpen(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Profile Section */}
      {isProfileActive && (
        <ProfileSection
          role="DOCTOR"
          user={activeDoctor}
          onProfileUpdated={(updated) => {
            if (onUpdateSchedule) onUpdateSchedule(activeDoctor.id, updated);
          }}
          onDeleteProfile={() => {
            if (onDeleteDoctor) onDeleteDoctor(activeDoctor.id);
          }}
        />
      )}

      {/* Schedule Edit Panel */}
      {isEditingSchedule && (
        <div className="card" style={{ marginBottom: '32px', border: '1.5px solid #0284c7' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: '#0284c7' }}>
            Update Weekly Schedule & Shift Hours for {activeDoctor.name}
          </h3>
          <form onSubmit={handleSaveSchedule} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Working Hours</label>
              <input
                type="text"
                className="form-input"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="e.g. 09:00 AM - 04:00 PM"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Available Days (comma separated)</label>
              <input
                type="text"
                className="form-input"
                value={availableDays}
                onChange={(e) => setAvailableDays(e.target.value)}
                placeholder="Monday, Wednesday, Friday"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#0284c7' }}>
                <Save size={16} /> Save Changes
              </button>
              <button type="button" onClick={() => setIsEditingSchedule(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs & Appointment Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                backgroundColor: filter === status ? '#0284c7' : '#ffffff',
                color: filter === status ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: filter === status ? '#0284c7' : 'var(--border-subtle)',
                transition: 'all 0.15s ease'
              }}
            >
              {status} ({doctorAppointments.filter(a => status === 'ALL' ? true : a.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAppointments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
            <Calendar size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Appointments for {activeDoctor.name}</h3>
            <p>No appointments match the selected filter category for this physician.</p>
          </div>
        ) : (
          filteredAppointments.map(apt => (
            <div key={apt.id} className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>
                  <User size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>{apt.id}</span>
                    <span className={`badge badge-${apt.status.toLowerCase()}`}>{apt.status}</span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{apt.patientName}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                    <strong>Condition / Reason:</strong> {apt.reason}
                  </p>
                  {apt.notes && (
                    <div style={{ fontSize: '0.825rem', color: '#047857', backgroundColor: '#ecfdf5', padding: '6px 10px', borderRadius: '6px', marginTop: '6px' }}>
                      <strong>Dr. Notes:</strong> {apt.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Date & Action Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{apt.date}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{apt.time}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {apt.status === 'PENDING' && (
                    <button
                      onClick={() => onUpdateStatus(apt.id, 'CONFIRMED')}
                      className="btn btn-primary btn-sm"
                      style={{ background: '#10b981' }}
                    >
                      <CheckCircle size={15} /> Confirm
                    </button>
                  )}

                  {apt.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleOpenCompleteModal(apt)}
                      className="btn btn-primary btn-sm"
                      style={{ background: '#0284c7' }}
                    >
                      <FileText size={15} /> Complete Visit
                    </button>
                  )}

                  {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                    <button
                      onClick={() => onUpdateStatus(apt.id, 'CANCELLED')}
                      className="btn btn-danger-outline btn-sm"
                    >
                      <XCircle size={15} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Complete Visit & Clinical Notes Modal */}
      {selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Complete Consultation</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Patient: <strong>{selectedAppointment.patientName}</strong> | {selectedAppointment.reason}
            </p>

            <form onSubmit={handleSaveNotesAndComplete}>
              <div className="form-group">
                <label className="form-label">Clinical Observations & Prescription</label>
                <textarea
                  rows="4"
                  className="form-textarea"
                  placeholder="Enter medical findings, prescribed medication dosages, or follow-up instructions..."
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, background: '#0284c7' }}
                >
                  Save & Complete Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
