import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldPlus, GripVertical, ArrowUp, ArrowDown, Save, RotateCcw, Check } from 'lucide-react';
import RoleMappingModal from './RoleMappingModal';

export default function RoleMappingView({ roles, onSaveRole, onUpdatePriorities }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localRoles, setLocalRoles] = useState(roles);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    // Keep local list sorted by priority when roles prop updates from DB
    const sorted = [...roles].sort((a, b) => a.priority - b.priority);
    setLocalRoles(sorted);
    setHasChanges(false);
  }, [roles]);

  const handleSaveNewRole = (roleName, priority) => {
    onSaveRole(roleName, priority);
    setIsModalOpen(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const reordered = [...localRoles];
      const [movedItem] = reordered.splice(draggedIndex, 1);
      reordered.splice(dragOverIndex, 0, movedItem);

      // Reassign unique sequential 1-based priorities
      const updated = reordered.map((r, idx) => ({
        ...r,
        priority: idx + 1
      }));

      setLocalRoles(updated);
      setHasChanges(true);
      setSaveSuccess(false);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMove = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localRoles.length) return;

    const reordered = [...localRoles];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, movedItem);

    // Reassign unique 1-based priorities
    const updated = reordered.map((r, idx) => ({
      ...r,
      priority: idx + 1
    }));

    setLocalRoles(updated);
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleReset = () => {
    const sorted = [...roles].sort((a, b) => a.priority - b.priority);
    setLocalRoles(sorted);
    setHasChanges(false);
    setSaveSuccess(false);
  };

  const handleApplyChanges = async () => {
    setIsSaving(true);
    try {
      await onUpdatePriorities(localRoles);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving role order:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header-actions" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
            <ShieldCheck size={20} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>System Roles Hierarchy</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '1.6rem' }}>
            Drag and drop rows to reorder. Click <strong>"Save Priority Order"</strong> to persist changes to the database.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {hasChanges && (
            <>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isSaving}
                title="Discard unsaved changes"
              >
                <RotateCcw size={15} /> Reset
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleApplyChanges}
                disabled={isSaving}
                style={{ 
                  backgroundColor: '#10b981', 
                  borderColor: '#059669',
                  boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.25)',
                  fontWeight: 600
                }}
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Priority Order'}
              </button>
            </>
          )}

          {saveSuccess && (
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Check size={16} /> Saved to Database!
            </span>
          )}

          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <ShieldPlus size={16} /> Add New Role
          </button>
        </div>
      </div>

      {hasChanges && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.65rem 1rem', 
          backgroundColor: '#fef3c7', 
          border: '1px solid #fde68a', 
          borderRadius: '6px', 
          color: '#92400e',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>⚠️ You have unsaved priority reorder changes. Click <strong>"Save Priority Order"</strong> above to update the database.</span>
        </div>
      )}

      <div className="table-responsive" style={{ marginTop: '1rem' }}>
        <table className="hr-table">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Reorder</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Serial #</th>
              <th>Role Name</th>
              <th style={{ width: '160px', textAlign: 'center' }}>Priority Level</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Quick Shift</th>
            </tr>
          </thead>
          <tbody>
            {localRoles.length > 0 ? (
              localRoles.map((role, idx) => {
                const isDragging = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;

                return (
                  <tr
                    key={role.id || role.role_id || role.role}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    style={{
                      cursor: 'grab',
                      opacity: isDragging ? 0.4 : 1,
                      backgroundColor: isDragOver ? 'var(--color-accent-light)' : 'transparent',
                      borderTop: isDragOver && draggedIndex > idx ? '2px solid var(--color-primary)' : 'none',
                      borderBottom: isDragOver && draggedIndex < idx ? '2px solid var(--color-primary)' : 'none',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <td style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      <GripVertical size={18} style={{ cursor: 'grab', verticalAlign: 'middle' }} />
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 500 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{role.role}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'var(--color-primary-light)',
                        borderRadius: '50%',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: 'var(--color-primary)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        {idx + 1}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.3rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.45rem' }}
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, 'up')}
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.45rem' }}
                          disabled={idx === localRoles.length - 1}
                          onClick={() => handleMove(idx, 'down')}
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  No roles defined.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <RoleMappingModal
          existingRoles={localRoles}
          defaultPriority={localRoles.length + 1}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNewRole}
        />
      )}
    </div>
  );
}
