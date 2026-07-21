import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function UserMappingModal({ user, roles, onClose, onSave }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('active');
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setStatus(user.status || 'active');
      setSelectedRoles(user.roles || []);
    } else {
      setEmail('');
      setStatus('active');
      setSelectedRoles([]);
    }
  }, [user]);

  const handleRoleToggle = (rName) => {
    if (selectedRoles.includes(rName)) {
      setSelectedRoles(selectedRoles.filter(r => r !== rName));
    } else {
      setSelectedRoles([...selectedRoles, rName]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    onSave(email, status, selectedRoles, user?.id || null);
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

        <h3 className="modal-title">
          {user ? 'Edit User Mapping' : 'Add New User'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">User Email ID</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!user}
              placeholder="e.g. amit.sharma@aviators.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status (Select one)</label>
            <div className="status-radio-group">
              <div 
                className={`status-radio-button ${status === 'active' ? 'active' : ''}`}
                onClick={() => setStatus('active')}
              >
                <span>Active</span>
              </div>
              <div 
                className={`status-radio-button ${status === 'inactive' ? 'active' : ''}`}
                onClick={() => setStatus('inactive')}
              >
                <span>Inactive</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Roles to be assigned (Multiple Select)</label>
            <div className="checkbox-grid">
              {roles.map((r) => {
                const isSelected = selectedRoles.includes(r.role);
                return (
                  <div
                    key={r.id || r.role_id}
                    className={`checkbox-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleRoleToggle(r.role)}
                  >
                    <span>{isSelected ? '[X]' : '[ ]'} {r.role}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
