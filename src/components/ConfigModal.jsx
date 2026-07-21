import React, { useState } from 'react';
import { X, Save, Database } from 'lucide-react';
import dbService from '../services/db';

export default function ConfigModal({ onClose, onSaveConfig }) {
  const [url, setUrl] = useState(dbService.supabaseUrl);
  const [key, setKey] = useState(dbService.supabaseKey);
  const [useSupabase, setUseSupabase] = useState(dbService.useSupabase);

  const handleSubmit = (e) => {
    e.preventDefault();
    dbService.updateConfig(url, key, useSupabase);
    onSaveConfig();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
          <Database size={22} />
          <h3 className="modal-title" style={{ margin: 0 }}>Database Integration Settings</h3>
        </div>

        <form onSubmit={handleSubmit} className="config-form">
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="toggle-switch-label">
              <input
                type="checkbox"
                checked={useSupabase}
                onChange={(e) => setUseSupabase(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              Enable Live Supabase Connection
            </label>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '1.75rem' }}>
              When enabled, mutations and fetches target your Supabase schema tables. Otherwise, mock LocalStorage is utilized.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Supabase Project URL</label>
            <input
              type="text"
              className="form-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              disabled={!useSupabase}
              required={useSupabase}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supabase Key (Service Role or Anon Key)</label>
            <input
              type="password"
              className="form-input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJI..."
              disabled={!useSupabase}
              required={useSupabase}
            />
          </div>

          <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
