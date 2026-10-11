import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import Navbar from './components/Navbar';
import PatientPortal from './components/PatientPortal';
import DoctorPortal from './components/DoctorPortal';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/AuthPage';
import { api } from './services/api';
import { INITIAL_DOCTORS, INITIAL_PATIENTS, INITIAL_APPOINTMENTS } from './data/mockData';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState('PATIENT'); // 'PATIENT' | 'DOCTOR' | 'ADMIN'
  const [currentUser, setCurrentUser] = useState(null);

  // Tab states for role portals
  const [patientTab, setPatientTab] = useState('browse'); // 'browse' | 'my-appointments' | 'profile'
  const [doctorTab, setDoctorTab] = useState('appointments'); // 'appointments' | 'profile'
  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'doctors' | 'patients' | 'profile'

  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);

  // Load backend data from Medicare MySQL database on component load & role changes
  const refreshData = async () => {
    try {
      const docList = await api.getAllDoctors();
      if (docList && docList.length > 0) {
        const specialtyAvatars = {
          'Cardiology': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
          'Neurology': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
          'Pediatrics': 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&q=80&w=300',
          'Orthopedics': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
          'General Medicine': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
          'Oncology': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
          'Dermatology': 'https://images.unsplash.com/photo-1594824813629-9e8c45d3cf4f?auto=format&fit=crop&q=80&w=300'
        };

        setDoctors(docList.map(d => ({
          ...d,
          fee: d.consultationFee || '$100',
          availableDays: d.availableDays ? (typeof d.availableDays === 'string' ? d.availableDays.split(',').map(s => s.trim()) : d.availableDays) : ['Monday', 'Wednesday', 'Friday'],
          workingHours: d.workingHours || '09:00 AM - 04:00 PM',
          rating: d.rating || 4.9,
          reviewsCount: d.reviewsCount || 95,
          slots: d.slots && d.slots.length > 0 ? d.slots : ["09:00 AM", "10:30 AM", "11:45 AM", "02:00 PM", "03:30 PM", "04:45 PM"],
          avatar: d.avatar || specialtyAvatars[d.specialization] || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
        })));
      }
    } catch (e) {
      console.warn("Using local doctors fallback:", e.message);
    }

    if (isAuthenticated) {
      try {
        const patList = await api.getAllPatients();
        if (patList && patList.length > 0) {
          setPatients(patList);
        }
      } catch (e) {
        console.warn("Using local patients fallback:", e.message);
      }

      try {
        const aptList = await api.getAllAppointments();
        if (aptList && aptList.length > 0) {
          setAppointments(aptList.map(a => ({
            id: a.id,
            patientId: a.patient?.id || a.patientId,
            patientName: a.patient?.name || a.patientName || 'Patient',
            doctorId: a.doctor?.id || a.doctorId,
            doctorName: a.doctor?.name || a.doctorName || 'Doctor',
            doctorSpecialization: a.doctor?.specialization || a.doctorSpecialization || 'General',
            date: a.appointmentDate || a.date,
            time: a.appointmentTime || a.time,
            status: a.status,
            reason: a.reason,
            notes: a.notes
          })));
        }
      } catch (e) {
        console.warn("Using local appointments fallback:", e.message);
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, [isAuthenticated, currentRole]);

  // Authentication handlers
  const handleLoginSuccess = async ({ role, user, token }) => {
    setCurrentRole(role);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setPatientTab('browse');
    setDoctorTab('appointments');
    setAdminTab('overview');

    try {
      const fullProfile = await api.getMyProfile();
      if (fullProfile) {
        setCurrentUser(prev => ({ ...prev, ...fullProfile }));
      }
    } catch (err) {
      console.warn("Could not fetch full profile:", err.message);
    }

    refreshData();
  };

  const handleOpenProfile = () => {
    if (currentRole === 'PATIENT') {
      setPatientTab('profile');
    } else if (currentRole === 'DOCTOR') {
      setDoctorTab('profile');
    } else if (currentRole === 'ADMIN') {
      setAdminTab('profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medicare_token');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem('medicare_token');
    setIsAuthenticated(false);
  };

  // Handlers for MySQL CRUD logic
  const handleBookAppointment = async (newAppointment) => {
    try {
      const patientId = newAppointment.patientId || (currentUser ? currentUser.id : 1);
      await api.bookAppointment(patientId, {
        doctorId: newAppointment.doctorId,
        appointmentDate: newAppointment.appointmentDate || newAppointment.date,
        appointmentTime: newAppointment.appointmentTime || newAppointment.time,
        reason: newAppointment.reason
      });
      await refreshData();
    } catch (e) {
      // Local fallback state update
      setAppointments(prev => [newAppointment, ...prev]);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await api.deleteAppointment(appointmentId);
      await refreshData();
    } catch (e) {
      setAppointments(prev => prev.filter(a => a.id !== appointmentId));
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus, notes = '') => {
    try {
      await api.updateAppointmentStatus(appointmentId, newStatus, notes);
      await refreshData();
    } catch (e) {
      setAppointments(prev => prev.map(a => {
        if (a.id === appointmentId) {
          return { ...a, status: newStatus, notes: notes ? notes : a.notes };
        }
        return a;
      }));
    }
  };

  const handleUpdateSchedule = async (doctorId, updatedSchedule) => {
    try {
      await api.updateDoctor(doctorId, {
        workingHours: updatedSchedule.workingHours,
        availableDays: Array.isArray(updatedSchedule.availableDays)
          ? updatedSchedule.availableDays.join(',')
          : updatedSchedule.availableDays
      });
      await refreshData();
    } catch (e) {
      setDoctors(prev => prev.map(d => {
        if (d.id === doctorId) {
          return {
            ...d,
            workingHours: updatedSchedule.workingHours,
            availableDays: updatedSchedule.availableDays
          };
        }
        return d;
      }));
    }
  };

  const handleAddDoctor = async (newDoctorData) => {
    try {
      const cleanEmail = newDoctorData.email || `${newDoctorData.name.toLowerCase().replace(/[^a-z]/g, '')}@medicare.com`;
      const generatedUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '');
      await api.register({
        username: generatedUsername.length >= 3 ? generatedUsername : `${generatedUsername}doc`,
        password: 'DoctorPassword123!',
        email: cleanEmail,
        name: newDoctorData.name,
        role: 'DOCTOR',
        specialization: newDoctorData.specialization,
        experience: newDoctorData.experience || '5+ years',
        phone: newDoctorData.phone || '+1 (555) 000-1122',
        workingHours: newDoctorData.workingHours || '09:00 AM - 04:00 PM',
        availableDays: newDoctorData.availableDays || 'Monday,Wednesday,Friday',
        consultationFee: newDoctorData.consultationFee || '$120'
      });
      await refreshData();
    } catch (e) {
      setDoctors(prev => [{ ...newDoctorData, id: Date.now() }, ...prev]);
    }
  };

  const handleDeleteMyProfile = async () => {
    try {
      await api.deleteMyProfile();
    } catch (e) {
      console.warn("Delete profile API fallback:", e.message);
      if (currentRole === 'PATIENT' && currentUser?.id) {
        setPatients(prev => prev.filter(p => p.id !== currentUser.id));
      } else if (currentRole === 'DOCTOR' && currentUser?.id) {
        setDoctors(prev => prev.filter(d => d.id !== currentUser.id));
      }
    }
    localStorage.removeItem('medicare_token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    await refreshData();
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      await api.deleteDoctor(doctorId);
      await refreshData();
    } catch (e) {
      setDoctors(prev => prev.filter(d => d.id !== doctorId));
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      await api.deletePatient(patientId);
      await refreshData();
    } catch (e) {
      setPatients(prev => prev.filter(p => p.id !== patientId));
    }
  };

  const handleUpdatePatient = async (patientIdOrObj, updates) => {
    const id = (typeof patientIdOrObj === 'object' && patientIdOrObj !== null) ? patientIdOrObj.id : patientIdOrObj;
    const up = (typeof patientIdOrObj === 'object' && patientIdOrObj !== null) ? patientIdOrObj : updates;
    try {
      if (id) {
        await api.updatePatient(id, up);
      }
      await refreshData();
      if (currentUser && (currentUser.id === id || currentRole === 'PATIENT')) {
        setCurrentUser(prev => ({ ...prev, ...up }));
      }
    } catch (e) {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...up } : p));
      if (currentUser && (currentUser.id === id || currentRole === 'PATIENT')) {
        setCurrentUser(prev => ({ ...prev, ...up }));
      }
    }
  };

  const handleUpdateDoctor = async (doctorIdOrObj, updates) => {
    const id = (typeof doctorIdOrObj === 'object' && doctorIdOrObj !== null) ? doctorIdOrObj.id : doctorIdOrObj;
    const up = (typeof doctorIdOrObj === 'object' && doctorIdOrObj !== null) ? doctorIdOrObj : updates;
    try {
      if (id) {
        await api.updateDoctor(id, up);
      }
      await refreshData();
      if (currentUser && (currentUser.id === id || currentRole === 'DOCTOR')) {
        setCurrentUser(prev => ({ ...prev, ...up }));
      }
    } catch (e) {
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, ...up } : d));
      if (currentUser && (currentUser.id === id || currentRole === 'DOCTOR')) {
        setCurrentUser(prev => ({ ...prev, ...up }));
      }
    }
  };

  // If not authenticated, render the dedicated Multi-Portal Auth Screen
  if (!isAuthenticated) {
    return (
      <AuthPage
        initialRole={currentRole}
        onLoginSuccess={handleLoginSuccess}
        doctors={doctors}
        patients={patients}
      />
    );
  }

  // Active context fallbacks
  const activePatient = (currentRole === 'PATIENT' && currentUser) ? currentUser : patients[0];
  const activeDoctor = (currentRole === 'DOCTOR' && currentUser) ? currentUser : doctors[0];
  const activeAdmin = (currentRole === 'ADMIN' && currentUser) ? currentUser : { name: 'Dr. Arthur Vance (Director)', email: 'admin@medicare.com', role: 'ADMIN' };

  const getActiveUser = () => {
    if (currentRole === 'PATIENT') return activePatient;
    if (currentRole === 'DOCTOR') return activeDoctor;
    return activeAdmin;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation with Active Role Indicator & User Profile */}
      <Navbar
        currentRole={currentRole}
        activeUser={getActiveUser()}
        onLogout={handleLogout}
        onSwitchAccount={handleSwitchAccount}
        onOpenProfile={handleOpenProfile}
      />

      {/* Main Content Area - Strictly Scoped by Role */}
      <main style={{ flex: 1 }}>
        {currentRole === 'PATIENT' && (
          <PatientPortal
            doctors={doctors}
            appointments={appointments}
            activePatient={activePatient}
            activeTab={patientTab}
            onTabChange={setPatientTab}
            onBookAppointment={handleBookAppointment}
            onCancelAppointment={handleCancelAppointment}
            onUpdatePatient={handleUpdatePatient}
            onDeletePatient={handleDeleteMyProfile}
          />
        )}

        {currentRole === 'DOCTOR' && (
          <DoctorPortal
            activeDoctor={activeDoctor}
            doctors={doctors}
            activeTab={doctorTab}
            onTabChange={setDoctorTab}
            onSwitchDoctor={(newDoctor) => setCurrentUser(newDoctor)}
            appointments={appointments}
            onUpdateStatus={handleUpdateStatus}
            onUpdateSchedule={handleUpdateDoctor}
            onDeleteDoctor={handleDeleteMyProfile}
          />
        )}

        {currentRole === 'ADMIN' && (
          <AdminDashboard
            doctors={doctors}
            patients={patients}
            appointments={appointments}
            adminUser={activeAdmin}
            activeTab={adminTab}
            onTabChange={setAdminTab}
            onAddDoctor={handleAddDoctor}
            onUpdateAppointmentStatus={handleUpdateStatus}
            onDeleteDoctor={handleDeleteDoctor}
            onDeletePatient={handleDeletePatient}
            onDeleteAppointment={handleCancelAppointment}
            onDeleteAdmin={handleDeleteMyProfile}
            onUpdateAdmin={(updated) => {
              setCurrentUser(prev => ({ ...prev, ...updated }));
            }}
          />
        )}

        {/* Access Denied Guard if role is invalid or unauthorized */}
        {currentRole !== 'PATIENT' && currentRole !== 'DOCTOR' && currentRole !== 'ADMIN' && (
          <div style={{
            maxWidth: '560px',
            margin: '80px auto',
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #fee2e2',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.1)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <ShieldAlert size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#991b1b', marginBottom: '8px' }}>
              Access Restricted
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
              You do not have authorization to access this clinical portal view.
            </p>
            <button
              onClick={handleSwitchAccount}
              style={{
                padding: '10px 24px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign In with Authorized Account
            </button>
          </div>
        )}
      </main>

      {/* Clinic System Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#64748b'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>MediCare Connect</strong> — Clinic Appointment & Patient Management System
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {/* <span>Frontend: React.js + Vite</span>
            <span>Backend: Spring Boot 3.x</span>
            <span>Database: MySQL (JPA)</span> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
