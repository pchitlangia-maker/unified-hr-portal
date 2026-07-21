import React, { useState } from 'react';
import { Link2, Plus, Edit2, Trash2, X, CheckCircle2, Award, Briefcase } from 'lucide-react';
import Toast from './common/Toast';

export default function JobRubricMappingView({ 
  mappings = [], 
  jobs = [], 
  rubrics = [], 
  onSaveMapping, 
  onDeleteMapping 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Form state
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedRubricId, setSelectedRubricId] = useState('');
  const [status, setStatus] = useState('Active');

  const handleOpenAddModal = () => {
    setEditingMapping(null);
    setSelectedJobId(jobs.length > 0 ? jobs[0].job_id || jobs[0].id : '');
    setSelectedRubricId(rubrics.length > 0 ? rubrics[0].rubric_id || rubrics[0].id : '');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mapping) => {
    setEditingMapping(mapping);
    setSelectedJobId(mapping.job_id || '');
    setSelectedRubricId(mapping.rubric_id || '');
    setStatus(mapping.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJobId || !selectedRubricId) {
      alert('Please select both a job position and an evaluation rubric.');
      return;
    }

    const matchedJob = jobs.find(j => (j.job_id === selectedJobId || j.id === selectedJobId));
    const matchedRubric = rubrics.find(r => (r.rubric_id === selectedRubricId || r.id === selectedRubricId));

    const payload = {
      mapping_id: editingMapping ? editingMapping.mapping_id : `MAP00${Date.now().toString().slice(-3)}`,
      job_id: selectedJobId,
      job_title: matchedJob ? matchedJob.title : selectedJobId,
      rubric_id: selectedRubricId,
      rubric_title: matchedRubric ? matchedRubric.title : selectedRubricId,
      status
    };

    await onSaveMapping(payload, editingMapping ? editingMapping.id : null);
    setIsModalOpen(false);
    setToastMsg(editingMapping ? 'Job-Rubric mapping updated!' : 'Job position linked to Rubric successfully!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDelete = async (mapping) => {
    if (window.confirm(`Are you sure you want to remove mapping "${mapping.mapping_id}"?`)) {
      await onDeleteMapping(mapping.id || mapping.mapping_id);
      setToastMsg('Mapping removed.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="card">
      <Toast message={toastMsg} />

      {/* Header Section */}
      <div className="card-header-actions" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
            <Link2 size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Job & Rubric Connections</h3>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: '1.6rem' }}>
            Map active job openings to their corresponding evaluation scorecards for AI screening execution.
          </span>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} /> Add Job-Rubric Link
        </button>
      </div>

      {/* Active Connections Table */}
      <div className="table-responsive" style={{ marginTop: '1rem' }}>
        <table className="hr-table" style={{ width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-primary-light)' }}>
              <th style={{ width: '110px', textAlign: 'center', fontSize: '0.75rem' }}>MAPPING ID</th>
              <th style={{ textAlign: 'left', fontSize: '0.75rem' }}>JOB POSITION</th>
              <th style={{ textAlign: 'left', fontSize: '0.75rem' }}>EVALUATION RUBRIC</th>
              <th style={{ width: '120px', textAlign: 'center', fontSize: '0.75rem' }}>STATUS</th>
              <th style={{ width: '130px', textAlign: 'center', fontSize: '0.75rem' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {mappings.length > 0 ? (
              mappings.map((m, idx) => (
                <tr key={m.id || m.mapping_id || idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {/* MAPPING ID */}
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
                      {m.mapping_id || `MAP00${m.id || idx + 1}`}
                    </span>
                  </td>

                  {/* JOB POSITION */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Briefcase size={16} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                        {m.job_title}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        ({m.job_id})
                      </span>
                    </div>
                  </td>

                  {/* EVALUATION RUBRIC */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Award size={16} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                        {m.rubric_title}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        ({m.rubric_id})
                      </span>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.65rem',
                      borderRadius: '12px',
                      backgroundColor: m.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                      color: m.status === 'Active' ? '#166534' : 'var(--color-text-muted)',
                      display: 'inline-block'
                    }}>
                      {m.status || 'Active'}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleOpenEditModal(m)}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.55rem', fontSize: '0.775rem' }}
                        title="Edit Connection"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m)}
                        style={{
                          background: 'none',
                          border: '1px solid #fecaca',
                          color: '#ef4444',
                          borderRadius: '6px',
                          padding: '0.3rem 0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Remove Connection"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                  No job-rubric links defined yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>

            <h3 className="modal-title" style={{ margin: '0 0 1.25rem 0' }}>
              {editingMapping ? 'Edit Job-Rubric Connection' : 'Link Job to Rubric'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* SELECT JOB POSITION */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  SELECT JOB POSITION *
                </label>
                <select
                  className="form-input"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  required
                >
                  {jobs.map(j => (
                    <option key={j.id || j.job_id} value={j.job_id || j.id}>
                      {j.title} ({j.job_id})
                    </option>
                  ))}
                </select>
              </div>

              {/* SELECT RUBRIC */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  SELECT EVALUATION RUBRIC *
                </label>
                <select
                  className="form-input"
                  value={selectedRubricId}
                  onChange={(e) => setSelectedRubricId(e.target.value)}
                  required
                >
                  {rubrics.map(r => (
                    <option key={r.id || r.rubric_id} value={r.rubric_id || r.id}>
                      {r.title} ({r.rubric_id})
                    </option>
                  ))}
                </select>
              </div>

              {/* STATUS */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  CONNECTION STATUS
                </label>
                <select
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMapping ? 'Save Link' : 'Create Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
