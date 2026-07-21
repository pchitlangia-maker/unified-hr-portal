import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function RoleGuard({ children, user }) {
  const isAuthorized = user && user.status === 'active' && user.roles && user.roles.length > 0;

  if (!isAuthorized) {
    return (
      <div className="restricted-container">
        <div className="restricted-card">
          <ShieldAlert className="restricted-icon" />
          <h2 className="restricted-title">Access Restricted</h2>
          <p className="restricted-desc">
            Admin hasn't mapped any role to your user ID, kindly contact the Admin.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
