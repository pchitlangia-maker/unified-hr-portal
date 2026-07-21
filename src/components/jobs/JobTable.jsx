import React from 'react';
import { Briefcase, Edit2, Trash2 } from 'lucide-react';

export default function JobTable({
  jobs,
  searchQuery,
  onClearSearch,
  onEdit,
  onQuickStatusChange,
  onDelete
}) {
  return (
    <div className="card" style={{ padding: 0, borderRadius: '12px', overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="hr-table" style={{ width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-primary-light)' }}>
              <th style={{ width: '110px', textAlign: 'center', fontSize: '0.75rem' }}>JOB ID</th>
              <th style={{ textAlign: 'left', fontSize: '0.75rem' }}>JOB TITLE & DESCRIPTION</th>
              <th style={{ textAlign: 'left', fontSize: '0.75rem' }}>DESIRED SKILLS</th>
              <th style={{ width: '120px', textAlign: 'center', fontSize: '0.75rem' }}>STATUS</th>
              <th style={{ width: '150px', textAlign: 'center', fontSize: '0.75rem' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length > 0 ? (
              jobs.map((job) => {
                const jStatus = (job.status || 'Active');
                const skillsList = (job.desired_skills || '').split(',').map(s => s.trim()).filter(Boolean);

                return (
                  <tr key={job.id || job.job_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {/* JOB ID */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-accent-light)',
                        color: 'var(--color-primary-dark)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        {job.job_id || `JOB00${job.id}`}
                      </span>
                    </td>

                    {/* TITLE & DESCRIPTION */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-text-main)' }}>
                            {job.title}
                          </span>
                          <span style={{
                            fontSize: '0.675rem',
                            fontWeight: 700,
                            backgroundColor: 'var(--color-accent-light)',
                            color: 'var(--color-primary)',
                            border: '1px solid var(--color-border-warm)',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px'
                          }}>
                            {job.program_name || 'Aviators'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: '420px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.description}
                        </span>
                      </div>
                    </td>

                    {/* DESIRED SKILLS */}
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxWidth: '300px' }}>
                        {skillsList.length > 0 ? (
                          skillsList.slice(0, 4).map((skill, sIdx) => (
                            <span key={sIdx} style={{
                              fontSize: '0.725rem',
                              backgroundColor: 'var(--color-primary-light)',
                              color: 'var(--color-sidebar-text)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: 500
                            }}>
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>None specified</span>
                        )}
                        {skillsList.length > 4 && (
                          <span style={{ fontSize: '0.725rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                            +{skillsList.length - 4} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td style={{ textAlign: 'center' }}>
                      <select
                        value={jStatus}
                        onChange={(e) => onQuickStatusChange(job, e.target.value)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          border: '1px solid var(--color-border)',
                          cursor: 'pointer',
                          backgroundColor: (jStatus.toLowerCase() === 'active' || jStatus.toLowerCase() === 'open') 
                            ? '#dcfce7' 
                            : jStatus.toLowerCase() === 'draft' 
                            ? '#fef3c7' 
                            : '#f1f5f9',
                          color: (jStatus.toLowerCase() === 'active' || jStatus.toLowerCase() === 'open') 
                            ? '#166534' 
                            : jStatus.toLowerCase() === 'draft' 
                            ? '#92400e' 
                            : 'var(--color-text-muted)'
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => onEdit(job)}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.775rem' }}
                          title="Edit Job Details"
                        >
                          <Edit2 size={13} /> Edit
                        </button>

                        <button
                          onClick={() => onDelete(job.id || job.job_id)}
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
                          title="Delete Job Position"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={32} style={{ color: 'var(--color-border)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>No job positions found matching this filter.</span>
                    {searchQuery && (
                      <button className="btn btn-secondary" onClick={onClearSearch} style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        Clear Search Filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
