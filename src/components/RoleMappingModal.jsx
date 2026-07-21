import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function RoleMappingModal({ onClose, onSave, existingRoles = [], defaultPriority = 1 }) {
  const [roleName, setRoleName] = useState('');
  const [priority, setPriority] = useState(defaultPriority);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePriorityChange = (val) => {
    setPriority(val);
    setErrorMsg('');
  };

  const handleRoleNameChange = (val) => {
    setRoleName(val);
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = roleName.trim();
    const parsedPriority = parseInt(priority, 10);

    if (!trimmedName) {
      setErrorMsg('Please enter a role name.');
      return;
    }

    if (isNaN(parsedPriority) || parsedPriority < 1) {
      setErrorMsg('Priority must be a positive number.');
      return;
    }

    // Check if role name already exists
    const duplicateRole = existingRoles.find(r => r.role.toLowerCase() === trimmedName.toLowerCase());
    if (duplicateRole) {
      setErrorMsg(`Role "${duplicateRole.role}" already exists.`);
      return;
    }

    // Check if priority already exists
    const duplicatePriority = existingRoles.find(r => parseInt(r.priority, 10) === parsedPriority);
    if (duplicatePriority) {
      setErrorMsg(`Priority ${parsedPriority} is already assigned to "${duplicatePriority.role}". Priority must be unique.`);
      return;
    }

    onSave(trimmedName, parsedPriority);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        <h3 className="modal-title">Add New System Role</h3>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '0.825rem',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Role Name</label>
            <input
              type="text"
              className="form-input"
              value={roleName}
              onChange={(e) => handleRoleNameChange(e.target.value)}
              placeholder="e.g. Technical Reviewer"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority Position (Must be unique)</label>
            <input
              type="number"
              className="form-input"
              value={priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              placeholder="e.g. 1"
              min="1"
              required
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Lower number = Higher Priority. Must not duplicate an existing role's priority.
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
