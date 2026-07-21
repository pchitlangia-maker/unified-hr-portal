import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProgramManagementView({ programs, onSaveProgram, onDeleteProgram, onSelectProgram }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programName, setProgramName] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const autoGenerateProgramId = () => {
    let maxNum = 0;
    programs.forEach(p => {
      const match = (p.program_id || '').match(/PROG0*(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      } else if (p.id && typeof p.id === 'number') {
        if (p.id > maxNum) maxNum = p.id;
      }
    });
    const nextNum = maxNum + 1;
    return `PROG${String(nextNum).padStart(3, '0')}`;
  };

  const handleOpenAddModal = () => {
    setEditingProgram(null);
    setProgramName('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prog) => {
    setEditingProgram(prog);
    setProgramName(prog.program_name || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = programName.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a program name.');
      return;
    }

    // Check duplicate name
    const exists = programs.find(p => p.program_name.toLowerCase() === trimmed.toLowerCase() && (editingProgram ? (p.id !== editingProgram.id && p.program_id !== editingProgram.program_id) : true));
    if (exists) {
      setErrorMsg(`Program "${exists.program_name}" already exists.`);
      return;
    }

    await onSaveProgram(trimmed, editingProgram ? (editingProgram.id || editingProgram.program_id) : null);
    setIsModalOpen(false);
    setToastMsg(editingProgram ? 'Program updated!' : 'New program created!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDelete = async (prog) => {
    if (window.confirm(`Are you sure you want to delete program "${prog.program_name}"?`)) {
      await onDeleteProgram(prog.id || prog.program_id);
      setToastMsg('Program deleted.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {toastMsg && (
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
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="card">
        <div className="card-header-actions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
              <Layers size={20} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Program Management</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '1.6rem' }}>
              Define programs (e.g. Aviators, Techpreneur, Creatorprenur, AIprenur) mapped to job positions.
            </span>
          </div>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} /> Add New Program
          </button>
        </div>

        <div className="table-responsive" style={{ marginTop: '1rem' }}>
          <table className="hr-table" style={{ width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-primary-light)' }}>
                <th style={{ width: '120px', textAlign: 'center', fontSize: '0.75rem' }}>PROGRAM ID</th>
                <th style={{ textAlign: 'left', fontSize: '0.75rem' }}>PROGRAM NAME</th>
                <th style={{ width: '180px', textAlign: 'center', fontSize: '0.75rem' }}>CREATED DATE</th>
                <th style={{ width: '130px', textAlign: 'center', fontSize: '0.75rem' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {programs.length > 0 ? (
                programs.map((prog, idx) => (
                  <tr key={prog.id || prog.program_id || idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-accent-light)',
                        color: 'var(--color-primary-dark)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        {prog.program_id || `PROG00${prog.id || idx + 1}`}
                      </span>
                    </td>

                    <td style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                      {prog.program_name}
                    </td>

                    <td style={{ textAlign: 'center', fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                      {prog.created_at ? new Date(prog.created_at).toLocaleDateString() : 'N/A'}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => onSelectProgram ? onSelectProgram(prog) : handleOpenEditModal(prog)}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.775rem' }}
                          title="Edit Program Details & Mapped Users"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(prog)}
                          style={{
                            background: 'none',
                            border: '1px solid #fecaca',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '0.3rem 0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Delete Program"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                    No programs configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Program Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>

            <h3 className="modal-title" style={{ margin: '0 0 1rem 0' }}>
              {editingProgram ? 'Edit Program Name' : 'Add New Program'}
            </h3>

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
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  PROGRAM ID (AUTO-GENERATED)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editingProgram ? editingProgram.program_id : autoGenerateProgramId()}
                  readOnly
                  style={{ backgroundColor: 'var(--color-bg-light)', color: 'var(--color-text-muted)', cursor: 'not-allowed', fontWeight: 700 }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  PROGRAM NAME *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="e.g. Aviators, Techpreneur, Creatorprenur, AIprenur"
                  required
                  autoFocus
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProgram ? 'Update Program' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
