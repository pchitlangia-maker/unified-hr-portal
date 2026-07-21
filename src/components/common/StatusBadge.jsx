import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || 'Active').toLowerCase();
  
  let bg = '#f1f5f9';
  let color = '#64748b';

  if (normalized === 'active' || normalized === 'open') {
    bg = '#dcfce7';
    color = '#166534';
  } else if (normalized === 'draft') {
    bg = '#fef3c7';
    color = '#92400e';
  } else if (normalized === 'inactive' || normalized === 'closed') {
    bg = '#f1f5f9';
    color = '#64748b';
  }

  return (
    <span style={{
      fontSize: '0.75rem',
      fontWeight: 600,
      padding: '0.2rem 0.65rem',
      borderRadius: '12px',
      backgroundColor: bg,
      color: color,
      display: 'inline-block'
    }}>
      {status || 'Active'}
    </span>
  );
}
