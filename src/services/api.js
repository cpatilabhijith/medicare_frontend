const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('medicare_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth API
  async login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  // Patients API
  async getAllPatients() {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
  },

  async getPatientById(id) {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch patient');
    return res.json();
  },

  async updatePatient(id, updates) {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update patient profile');
    return res.json();
  },

  async deletePatient(id) {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete patient');
    return res.json();
  },

  // Doctors API
  async getAllDoctors() {
    const res = await fetch(`${API_BASE_URL}/doctors`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch doctors');
    return res.json();
  },

  async getDoctorById(id) {
    const res = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch doctor');
    return res.json();
  },

  async updateDoctor(id, updates) {
    const res = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update doctor profile');
    return res.json();
  },

  async deleteDoctor(id) {
    const res = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete doctor');
    return res.json();
  },

  // Appointments API
  async bookAppointment(patientId, appointmentData) {
    const res = await fetch(`${API_BASE_URL}/appointments/book?patientId=${patientId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to book appointment');
    return data;
  },

  async getAppointmentsByPatient(patientId) {
    const res = await fetch(`${API_BASE_URL}/appointments/patient/${patientId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch patient appointments');
    return res.json();
  },

  async getAppointmentsByDoctor(doctorId) {
    const res = await fetch(`${API_BASE_URL}/appointments/doctor/${doctorId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch doctor appointments');
    return res.json();
  },

  async getAllAppointments() {
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  async updateAppointmentStatus(id, status, notes = '') {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    });
    if (!res.ok) throw new Error('Failed to update appointment status');
    return res.json();
  },

  async deleteAppointment(id) {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete appointment');
    return res.json();
  },

  // Profile API
  async getMyProfile() {
    const res = await fetch(`${API_BASE_URL}/profile/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updatePatientProfile(updates) {
    const res = await fetch(`${API_BASE_URL}/profile/patient`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update patient profile');
    return res.json();
  },

  async updateDoctorProfile(updates) {
    const res = await fetch(`${API_BASE_URL}/profile/doctor`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update doctor profile');
    return res.json();
  },

  async updateAdminProfile(updates) {
    const res = await fetch(`${API_BASE_URL}/profile/admin`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update admin profile');
    return res.json();
  },

  async deleteMyProfile() {
    const res = await fetch(`${API_BASE_URL}/profile/me`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete profile');
    return data;
  }
};
