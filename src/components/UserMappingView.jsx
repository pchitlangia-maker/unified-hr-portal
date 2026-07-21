import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import UserMappingModal from './UserMappingModal';

export default function UserMappingView({ users, roles, onSaveUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSave = (email, status, selectedRoles, userId) => {
    onSaveUser(email, status, selectedRoles, userId);
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card">
      <div className="card-header-actions">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <UserPlus size={16} /> Add New User
        </button>
      </div>

      <div className="table-responsive">
        <table className="hr-table">
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>Serial number</th>
              <th>User email</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
              <th>Roles</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <tr key={user.id || user.email} onClick={() => handleOpenEditModal(user)}>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td>
                    <span className="clickable-email">{user.email}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-pill ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="role-badge-list">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((r, rIdx) => (
                          <span key={rIdx} className="role-badge-item">
                            {r}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>None</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  No users matched your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserMappingModal
          user={selectedUser}
          roles={roles}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
