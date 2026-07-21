import React from 'react';
import { Briefcase, Search, Filter, RotateCw, Plus, X } from 'lucide-react';

export default function JobTableHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedProgramFilter,
  onProgramFilterChange,
  programs,
  counts,
  onRefresh,
  onAddClick
}) {
  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              padding: '0.45rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Briefcase size={22} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
              Job Openings & Role Management
            </h2>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 2.5rem' }}>
            Create, organize, and monitor job listings synced with AI screening rubrics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem', height: '40px', fontSize: '0.85rem' }}
              placeholder="Search jobs, skills, IDs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Program Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} style={{ color: 'var(--color-text-muted)' }} />
            <select
              className="form-input"
              style={{ height: '40px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', minWidth: '150px' }}
              value={selectedProgramFilter}
              onChange={(e) => onProgramFilterChange(e.target.value)}
            >
              <option value="all">All Programs</option>
              {programs.map((p) => (
                <option key={p.id || p.program_id} value={p.program_name}>
                  {p.program_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onRefresh}
            className="btn btn-secondary"
            style={{ height: '40px', padding: '0 0.75rem' }}
            title="Refresh Listings"
          >
            <RotateCw size={16} />
          </button>

          {/* Primary Add Job Button */}
          <button
            onClick={onAddClick}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              height: '40px',
              boxShadow: '0 2px 6px rgba(232, 89, 12, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={18} /> Add New Job Opening
          </button>
        </div>
      </div>

      {/* Tabbed Navigation Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        borderBottom: '1px solid var(--color-border)',
        marginTop: '1.25rem',
        paddingBottom: '0'
      }}>
        {[
          { key: 'active', label: 'Active Jobs', count: counts.active },
          { key: 'draft', label: 'Job Drafts', count: counts.draft },
          { key: 'inactive', label: 'Inactive Jobs', count: counts.inactive },
          { key: 'all', label: 'All Jobs', count: counts.all }
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                paddingBottom: '0.65rem',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'var(--color-bg-light)',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                padding: '0.1rem 0.5rem',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
