import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      backgroundColor: '#10b981',
      color: '#ffffff',
      padding: '0.75rem 1.25rem',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: 600,
      fontSize: '0.9rem',
      zIndex: 1000
    }}>
      <CheckCircle2 size={18} />
      <span>{message}</span>
    </div>
  );
}
