import React, { useState } from 'react';
import { Search, Calendar, Clock, Star, MapPin, CheckCircle2, AlertCircle, Phone, Mail, X, Plus, User } from 'lucide-react';
import ProfileSection from './ProfileSection';

export default function PatientPortal({ 
  doctors, 
  appointments, 
  onBookAppointment, 
  onCancelAppointment, 
  activePatient, 
  onUpdatePatient, 
  onDeletePatient,
  activeTab: controlledTab,
  onTabChange
}) {
  const [internalTab, setInternalTab] = useState('browse'); // 'browse' | 'my-appointments' | 'profile'
  const activeTab = onTabChange && controlledTab !== undefined ? controlledTab : internalTab;
  const setActiveTab = onTabChange || setInternalTab;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('2026-09-20');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [slotError, setSlotError] = useState('');

  // Extract unique specialties
  const specialties = ['All', ...new Set(doctors.map(d => d.specialization))];

  // Filter doctors
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialization === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  // Filter patient's appointments (handles string/number IDs and nested patient object)
  const myAppointments = appointments.filter(a => {
    const pid = a.patientId !== undefined ? a.patientId : a.patient?.id;
    return activePatient?.id != null && String(pid) === String(activePatient.id);
  });

  // Check slot availability (Prevent duplicate bookings!)
  const isSlotBooked = (docId, date, slot) => {
    return appointments.some(a => {
      const aDocId = a.doctorId !== undefined ? a.doctorId : a.doctor?.id;
      const aDate = a.date || a.appointmentDate;
      const aTime = a.time || a.appointmentTime;
      return String(aDocId) === String(docId) &&
             String(aDate) === String(date) &&
             String(aTime) === String(slot) &&
             a.status !== 'CANCELLED';
    });
  };

  const handleOpenBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot('');
    setSlotError('');
    setReason('');
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!bookingDate) {
      setSlotError('Please choose an appointment date.');
      return;
    }
    if (!selectedSlot) {
      setSlotError('Please choose an available time slot.');
      return;
    }

    // Double-check validation against overlapping appointments
    if (isSlotBooked(selectedDoctor.id, bookingDate, selectedSlot)) {
      setSlotError('Slot already booked! Please select another time.');
      return;
    }

    const newAppointment = {
      doctorId: selectedDoctor.id,
      appointmentDate: bookingDate,
      appointmentTime: selectedSlot,
      reason: reason || 'General Consultation',
      patientId: activePatient.id,
      patientName: activePatient.name,
      doctorName: selectedDoctor.name,
      doctorSpecialization: selectedDoctor.specialization,
      date: bookingDate,
      time: selectedSlot,
      status: 'PENDING'
    };

    onBookAppointment(newAppointment);
    setBookingSuccess(newAppointment);
    setSelectedDoctor(null);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Patient Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px',
        color: '#ffffff',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <span style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '12px'
          }}>
            Welcome Back, {activePatient.name}
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Book Your Next Clinic Consultation
          </h2>
          <p style={{ color: '#a7f3d0', fontSize: '0.95rem', maxWidth: '600px' }}>
            Browse verified medical specialists, check real-time schedule openings, and secure your appointment with zero overlap or waiting.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '16px 24px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{myAppointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length}</div>
            <div style={{ fontSize: '0.75rem', color: '#d1fae5', textTransform: 'uppercase', fontWeight: 600 }}>Active Bookings</div>
          </div>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '16px 24px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{doctors.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#d1fae5', textTransform: 'uppercase', fontWeight: 600 }}>Available Doctors</div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {bookingSuccess && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1.5px solid #10b981',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#065f46',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="#10b981" />
            <div>
              <div style={{ fontWeight: 700 }}>Appointment Successfully Booked!</div>
              <div style={{ fontSize: '0.85rem' }}>
                With {bookingSuccess.doctorName} on {bookingSuccess.date} at {bookingSuccess.time}. Status: <strong>{bookingSuccess.status}</strong>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setBookingSuccess(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('browse')}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            backgroundColor: activeTab === 'browse' ? '#10b981' : '#f1f5f9',
            color: activeTab === 'browse' ? '#ffffff' : '#64748b'
          }}
        >
          Find & Book Doctors
        </button>
        <button
          onClick={() => setActiveTab('my-appointments')}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            backgroundColor: activeTab === 'my-appointments' ? '#10b981' : '#f1f5f9',
            color: activeTab === 'my-appointments' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          My Appointment History ({myAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            backgroundColor: activeTab === 'profile' ? '#10b981' : '#f1f5f9',
            color: activeTab === 'profile' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <User size={16} /> My Profile
        </button>
      </div>

      {activeTab === 'profile' && (
        <ProfileSection
          role="PATIENT"
          user={activePatient}
          onProfileUpdated={(updatedPatient) => {
            if (onUpdatePatient) onUpdatePatient(updatedPatient);
          }}
          onDeleteProfile={() => {
            if (onDeletePatient) onDeletePatient(activePatient.id);
          }}
        />
      )}

      {activeTab === 'browse' ? (
        <>
          {/* Search & Filter Controls */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '480px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search by doctor name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {specialties.map(spec => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: selectedSpecialty === spec ? '#10b981' : 'var(--border-subtle)',
                    backgroundColor: selectedSpecialty === spec ? '#ecfdf5' : '#ffffff',
                    color: selectedSpecialty === spec ? '#047857' : '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {filteredDoctors.map(doctor => (
              <div key={doctor.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <img
                      src={doctor.avatar}
                      alt={doctor.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=10b981&color=fff&size=140`;
                      }}
                      style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <span className="badge badge-confirmed" style={{ marginBottom: '6px' }}>
                        {doctor.specialization}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                        {doctor.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#f59e0b', marginTop: '2px' }}>
                        <Star size={15} fill="#f59e0b" />
                        <span style={{ fontWeight: 700 }}>{doctor.rating}</span>
                        <span style={{ color: '#94a3b8' }}>({doctor.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                      <Clock size={16} color="#0284c7" />
                      <span>{doctor.workingHours}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                      <Calendar size={16} color="#10b981" />
                      <span>{Array.isArray(doctor.availableDays) ? doctor.availableDays.join(', ') : (doctor.availableDays || 'Monday, Wednesday, Friday')}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Consultation Fee</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{doctor.fee}</span>
                  </div>
                  <button
                    onClick={() => handleOpenBooking(doctor)}
                    className="btn btn-primary"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Patient Appointment History */
        <div>
          {myAppointments.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <Calendar size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No Appointments Booked Yet</h3>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>You haven't scheduled any doctor visits yet.</p>
              <button onClick={() => setActiveTab('browse')} className="btn btn-primary">Find a Doctor</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myAppointments.map(apt => (
                <div key={apt.id} className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800
                    }}>
                      <Calendar size={28} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>{apt.id}</span>
                        <span className={`badge badge-${apt.status.toLowerCase()}`}>
                          {apt.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                        {apt.doctorName} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>({apt.doctorSpecialization})</span>
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                        Reason: {apt.reason}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={15} color="#10b981" /> {apt.date}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <Clock size={15} color="#0284c7" /> {apt.time}
                      </div>
                    </div>

                    {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                      <button
                        onClick={() => onCancelAppointment(apt.id)}
                        className="btn btn-danger-outline btn-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal with Real-time Duplicate Slot Prevention */}
      {selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Schedule Consultation</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>with {selectedDoctor.name} ({selectedDoctor.specialization})</p>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={22} />
              </button>
            </div>

            {slotError && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <AlertCircle size={18} />
                {slotError}
              </div>
            )}

            <form onSubmit={handleConfirmBooking}>
              <div className="form-group">
                <label className="form-label">Consultation Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setSelectedSlot('');
                    setSlotError('');
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Available Time Slots</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '6px' }}>
                  {(selectedDoctor.slots && selectedDoctor.slots.length > 0 ? selectedDoctor.slots : ["09:00 AM", "10:30 AM", "11:45 AM", "02:00 PM", "03:30 PM"]).map(slot => {
                    const booked = isSlotBooked(selectedDoctor.id, bookingDate, slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={booked}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setSlotError('');
                        }}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: booked ? 'not-allowed' : 'pointer',
                          border: '1.5px solid',
                          borderColor: booked ? '#e2e8f0' : selectedSlot === slot ? '#10b981' : 'var(--border-subtle)',
                          backgroundColor: booked ? '#f1f5f9' : selectedSlot === slot ? '#ecfdf5' : '#ffffff',
                          color: booked ? '#94a3b8' : selectedSlot === slot ? '#047857' : '#1e293b',
                          textDecoration: booked ? 'line-through' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {slot}
                        {booked && <div style={{ fontSize: '0.65rem', textDecoration: 'none', color: '#ef4444' }}>Booked</div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Reason for Visit / Symptoms</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="e.g. Chest tightness, prescription renewal, routine checkup"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
