import React, { useState } from 'react';
import { ArrowLeft, UserCheck, Shield, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import Toast from './common/Toast';

export default function ProgramDrillDownView({ 
  program, 
  users = [], 
  roles = [], 
  programMappings = [], 
  onBack, 
  onAddMappings, 
  onDeleteMapping 
}) {
  const [selectedRole, setSelectedRole] = useState(roles.length > 0 ? roles[0].role : '');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  // Filter active users mapped to selected role
  const activeUsers = users.filter(u => 
    (u.status || '').toLowerCase() === 'active' && 
    (u.roles || []).includes(selectedRole)
  );

  // Filter current program's mappings
  const currentMappings = programMappings.filter(m => m.program_name === program.program_name);

  const handleUserToggle = (email) => {
    setSelectedUsers(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === activeUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(activeUsers.map(u => u.email));
    }
  };

  const handleAddMappings = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }
    if (selectedUsers.length === 0) {
      alert('Please select at least one active user');
      return;
    }

    await onAddMappings(program.program_name, selectedRole, selectedUsers);
    setSelectedUsers([]);
    setToastMsg(`Mapped ${selectedUsers.length} user(s) to ${program.program_name}!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDelete = async (mappingId) => {
    if (window.confirm('Remove this user role mapping from the program?')) {
      await onDeleteMapping(mappingId);
      setToastMsg('Mapping removed.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Toast message={toastMsg} />

      {/* Header Banner with Back Button */}
      <div className="card" style={{ marginBottom: 0, padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={onBack}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <ArrowLeft size={16} /> Back to Programs
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-accent-light)',
                  color: 'var(--color-primary-dark)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {program.program_id}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                  {program.program_name} Program Configuration
                </h3>
              </div>
              <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.15rem', display: 'block' }}>
                Manage mapped users, assign system roles, and configure program team permissions.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Mapped Users Table (Left) + Add Role & Users Panel (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: EXISTING MAPPED USERS & ROLES TABLE */}
        <div className="card" style={{ marginBottom: 0, padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--color-text-main)' }}>
            Existing Mapped Users & Roles ({currentMappings.length})
          </h4>

          <div className="table-responsive">
            <table className="hr-table" style={{ width: '100%' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-primary-light)' }}>
                  <th style={{ textAlign: 'left', fontSize: '0.75rem' }}>USER EMAIL</th>
                  <th style={{ textAlign: 'left', fontSize: '0.75rem' }}>MAPPED ROLE</th>
                  <th style={{ width: '100px', textAlign: 'center', fontSize: '0.75rem' }}>STATUS</th>
                  <th style={{ width: '80px', textAlign: 'center', fontSize: '0.75rem' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {currentMappings.length > 0 ? (
                  currentMappings.map((mapItem) => (
                    <tr key={mapItem.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {/* USER EMAIL */}
                      <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {mapItem.user_email}
                      </td>

                      {/* MAPPED ROLE */}
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {mapItem.mapped_role}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '10px',
                          backgroundColor: '#dcfce7',
                          color: '#166534'
                        }}>
                          {mapItem.status || 'Active'}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleDelete(mapItem.id)}
                          style={{
                            background: 'none',
                            border: '1px solid #fecaca',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '0.25rem 0.45rem',
                            cursor: 'pointer'
                          }}
                          title="Delete Row"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-muted)' }}>
                      No users mapped to {program.program_name} yet. Use the panel on the right to assign team members.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: ADD ROLE & USERS ASSIGNMENT PANEL */}
        <div className="card" style={{ marginBottom: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
            <UserCheck size={18} style={{ color: 'var(--color-primary)' }} />
            <h4 style={{ fontSize: '0.975rem', fontWeight: 800, margin: 0, color: 'var(--color-text-main)' }}>
              Add Role & Users to Program
            </h4>
          </div>

          {/* SELECT ROLE DROPDOWN */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              1. SELECT SYSTEM ROLE *
            </label>
            <select
              className="form-input"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setSelectedUsers([]);
              }}
              style={{ fontWeight: 600 }}
            >
              {roles.map(r => (
                <option key={r.id || r.role_id} value={r.role}>
                  {r.role} (Priority #{r.priority})
                </option>
              ))}
            </select>
          </div>

          {/* SELECT ACTIVE USERS CHECKLIST */}
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
                2. SELECT ACTIVE USERS ({activeUsers.length}) *
              </label>
              {activeUsers.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllUsers}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.725rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {selectedUsers.length === activeUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '0.5rem',
              maxHeight: '220px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              backgroundColor: 'var(--color-bg-light)'
            }}>
              {activeUsers.length > 0 ? (
                activeUsers.map(user => {
                  const isChecked = selectedUsers.includes(user.email);
                  return (
                    <div
                      key={user.email}
                      onClick={() => handleUserToggle(user.email)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: isChecked ? 'var(--color-primary-light)' : '#FFFFFF',
                        border: isChecked ? '1px solid var(--color-border-warm)' : '1px solid var(--color-border)',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                      />
                      <span style={{ fontSize: '0.825rem', fontWeight: isChecked ? 700 : 500, color: 'var(--color-text-main)' }}>
                        {user.email}
                      </span>
                    </div>
                  );
                })
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', padding: '0.75rem', textAlign: 'center' }}>
                  No active users mapped to role "{selectedRole}".
                </span>
              )}
            </div>
          </div>

          {/* MAP USERS BUTTON */}
          <button
            className="btn btn-primary"
            onClick={handleAddMappings}
            disabled={selectedUsers.length === 0}
            style={{ width: '100%', justifyContent: 'center', height: '42px', marginTop: '0.5rem' }}
          >
            <Plus size={18} /> Map Users to Program ({selectedUsers.length})
          </button>
        </div>

      </div>
    </div>
  );
}
