import React from 'react';
import { Stethoscope, User, Shield, HeartPulse, LogOut, ArrowLeftRight } from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  activeUser, 
  onLogout,
  onSwitchAccount,
  onOpenProfile
}) {
  const roleColor = currentRole === 'PATIENT' ? '#059669' : currentRole === 'DOCTOR' ? '#0284c7' : '#7c3aed';
  const roleBg = currentRole === 'PATIENT' ? '#d1fae5' : currentRole === 'DOCTOR' ? '#e0f2fe' : '#ede9fe';
  const roleBorder = currentRole === 'PATIENT' ? '#a7f3d0' : currentRole === 'DOCTOR' ? '#bae6fd' : '#ddd6fe';
  const roleHoverBg = currentRole === 'PATIENT' ? '#ecfdf5' : currentRole === 'DOCTOR' ? '#f0f9ff' : '#f5f3ff';
  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <div 
          onClick={onSwitchAccount}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          title="Return to Login / Portal Hub"
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
          }}>
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', lineHeight: 1.1 }}>
              MediCare <span style={{ color: '#10b981' }}>Connect</span>
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              Clinic & Patient Management
            </span>
          </div>
        </div>

        {/* Active Portal Indicator (Role-Scoped: Patients only see Patient Portal, Doctors only see Doctor Portal) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {currentRole === 'PATIENT' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ecfdf5',
              padding: '8px 18px',
              borderRadius: '10px',
              border: '1px solid #a7f3d0'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981'
              }} />
              <User size={16} color="#047857" />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#065f46' }}>
                Patient Portal
              </span>
              <span style={{
                fontSize: '0.7rem',
                backgroundColor: '#d1fae5',
                color: '#047857',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600
              }}>
                Patient Scoped
              </span>
            </div>
          )}

          {currentRole === 'DOCTOR' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f0f9ff',
              padding: '8px 18px',
              borderRadius: '10px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#0284c7'
              }} />
              <Stethoscope size={16} color="#0369a1" />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#075985' }}>
                Doctor Clinical Portal
              </span>
              <span style={{
                fontSize: '0.7rem',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600
              }}>
                Doctor Scoped
              </span>
            </div>
          )}

          {currentRole === 'ADMIN' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f5f3ff',
              padding: '8px 18px',
              borderRadius: '10px',
              border: '1px solid #ddd6fe'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#7c3aed'
              }} />
              <Shield size={16} color="#6d28d9" />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#5b21b6' }}>
                Admin Dashboard
              </span>
              <span style={{
                fontSize: '0.7rem',
                backgroundColor: '#ede9fe',
                color: '#6d28d9',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600
              }}>
                Administrative Scoped
              </span>
            </div>
          )}
        </div>

        {/* User Identity Info & Logout Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Clickable Profile Card */}
          <button
            id="navbar-profile-btn"
            type="button"
            onClick={onOpenProfile}
            title="Click to view & edit your profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 12px',
              borderRadius: '12px',
              border: `1.5px solid transparent`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'right'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = roleHoverBg;
              e.currentTarget.style.borderColor = roleBorder;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                {activeUser?.name || 'User'}
              </div>
              <div style={{ 
                fontSize: '0.725rem', 
                fontWeight: 700,
                color: roleColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '4px'
              }}>
                <span>{currentRole} ACCOUNT</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>• Profile</span>
              </div>
            </div>

            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: roleBg,
              color: roleColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: `2px solid ${roleBorder}`,
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              {activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {/* Logout / Switch User Button */}
          <button
            onClick={onLogout}
            title="Log Out / Switch Account"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.borderColor = '#fca5a5';
              e.currentTarget.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
