import React, { useState, useEffect } from 'react';
import { Briefcase, X } from 'lucide-react';

export default function JobFormModal({
  isOpen,
  editingJob,
  programs,
  defaultJobId,
  onClose,
  onSave,
  onSaveAsDraft
}) {
  const [jobId, setJobId] = useState('');
  const [programName, setProgramName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [skills, setSkills] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (editingJob) {
      setJobId(editingJob.job_id || `JOB00${editingJob.id}`);
      setProgramName(editingJob.program_name || (programs.length > 0 ? programs[0].program_name : 'Aviators'));
      setTitle(editingJob.title || '');
      setDescription(editingJob.description || '');
      setResponsibilities(editingJob.roles_responsibilities || '');
      setSkills(editingJob.desired_skills || '');
      setStatus(editingJob.status || 'Active');
    } else {
      setJobId(defaultJobId);
      setProgramName(programs.length > 0 ? programs[0].program_name : 'Aviators');
      setTitle('');
      setDescription('');
      setResponsibilities('');
      setSkills('');
      setStatus('Active');
    }
  }, [editingJob, defaultJobId, programs, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description || !responsibilities || !skills) return;

    onSave({
      job_id: jobId,
      program_name: programName,
      title,
      description,
      roles_responsibilities: responsibilities,
      desired_skills: skills,
      status
    }, editingJob ? editingJob.id : null);
  };

  const handleDraftClick = (e) => {
    e.preventDefault();
    if (!title || !description || !responsibilities || !skills) {
      alert('Please fill in required fields before saving draft.');
      return;
    }

    onSaveAsDraft({
      job_id: jobId,
      program_name: programName,
      title,
      description,
      roles_responsibilities: responsibilities,
      desired_skills: skills,
      status: 'Draft'
    }, editingJob ? editingJob.id : null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px', width: '90%' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Briefcase size={22} style={{ color: 'var(--color-primary)' }} />
          <h3 className="modal-title" style={{ margin: 0 }}>
            {editingJob ? 'Edit Job Opening' : 'Add New Job Opening'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                JOB ID (AUTO-GENERATED)
              </label>
              <input
                type="text"
                className="form-input"
                value={jobId}
                readOnly
                style={{ backgroundColor: 'var(--color-bg-light)', color: 'var(--color-text-muted)', cursor: 'not-allowed', fontWeight: 700 }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                INITIAL STATUS *
              </label>
              <select
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              PROGRAM *
            </label>
            <select
              className="form-input"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              style={{ fontWeight: 600 }}
              required
            >
              {programs.map((p) => (
                <option key={p.id || p.program_id} value={p.program_name}>
                  {p.program_name} ({p.program_id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              JOB TITLE *
            </label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI Engineer"
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              JOB DESCRIPTION *
            </label>
            <textarea
              className="form-input"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the overarching goal of the position..."
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              ROLES & RESPONSIBILITIES *
            </label>
            <textarea
              className="form-input"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              placeholder="List day-to-day duties..."
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              DESIRED SKILLS (COMMA-SEPARATED) *
            </label>
            <input
              type="text"
              className="form-input"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. AI, LLM, RAG, Python, LangChain, OpenAI APIs"
              required
            />
          </div>

          <div className="modal-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleDraftClick}
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)', fontWeight: 600 }}
            >
              Save as Draft
            </button>
            <button type="submit" className="btn btn-primary">
              {editingJob ? 'Save & Publish' : 'Create Job Opening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
