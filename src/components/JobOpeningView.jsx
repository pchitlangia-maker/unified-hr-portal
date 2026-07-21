import React, { useState, useMemo } from 'react';
import JobTableHeader from './jobs/JobTableHeader';
import JobTable from './jobs/JobTable';
import JobFormModal from './jobs/JobFormModal';
import Toast from './common/Toast';

export default function JobOpeningView({ jobs, programs = [], onSaveJob, onDeleteJob, onRefresh }) {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const autoGenerateJobId = (existingJobs = jobs) => {
    let maxNum = 0;
    existingJobs.forEach(j => {
      const match = (j.job_id || '').match(/JOB0*(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      } else if (j.id && typeof j.id === 'number') {
        if (j.id > maxNum) maxNum = j.id;
      }
    });
    return `JOB${String(maxNum + 1).padStart(3, '0')}`;
  };

  const programFilteredJobs = useMemo(() => {
    if (selectedProgramFilter === 'all') return jobs;
    return jobs.filter(j => (j.program_name || '').toLowerCase() === selectedProgramFilter.toLowerCase());
  }, [jobs, selectedProgramFilter]);

  const counts = useMemo(() => {
    const active = programFilteredJobs.filter(j => (j.status || '').toLowerCase() === 'active' || (j.status || '').toLowerCase() === 'open').length;
    const draft = programFilteredJobs.filter(j => (j.status || '').toLowerCase() === 'draft').length;
    const inactive = programFilteredJobs.filter(j => (j.status || '').toLowerCase() === 'inactive' || (j.status || '').toLowerCase() === 'closed').length;
    return { active, draft, inactive, all: programFilteredJobs.length };
  }, [programFilteredJobs]);

  const filteredJobs = useMemo(() => {
    return programFilteredJobs.filter(j => {
      const jStatus = (j.status || '').toLowerCase();
      let matchesTab = true;
      if (activeTab === 'active') matchesTab = jStatus === 'active' || jStatus === 'open';
      else if (activeTab === 'draft') matchesTab = jStatus === 'draft';
      else if (activeTab === 'inactive') matchesTab = jStatus === 'inactive' || jStatus === 'closed';

      const q = searchQuery.toLowerCase().trim();
      let matchesSearch = true;
      if (q) {
        matchesSearch = (
          (j.job_id || '').toLowerCase().includes(q) ||
          (j.title || '').toLowerCase().includes(q) ||
          (j.program_name || '').toLowerCase().includes(q) ||
          (j.description || '').toLowerCase().includes(q) ||
          (j.desired_skills || '').toLowerCase().includes(q)
        );
      }
      return matchesTab && matchesSearch;
    });
  }, [programFilteredJobs, activeTab, searchQuery]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveModal = async (jobPayload, editingId) => {
    await onSaveJob(jobPayload, editingId);
    setIsModalOpen(false);
    showToast(editingId ? 'Job position updated!' : 'New job position created!');
  };

  const handleSaveDraftModal = async (jobPayload, editingId) => {
    await onSaveJob(jobPayload, editingId);
    setIsModalOpen(false);
    showToast(editingId ? 'Job position updated as draft!' : 'Job opening saved as draft!');
  };

  const handleQuickStatusChange = async (job, newStatus) => {
    const payload = { ...job, status: newStatus };
    await onSaveJob(payload, job.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job position?')) {
      await onDeleteJob(id);
      showToast('Job deleted successfully.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toastMsg} />

      <JobTableHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedProgramFilter={selectedProgramFilter}
        onProgramFilterChange={setSelectedProgramFilter}
        programs={programs}
        counts={counts}
        onRefresh={onRefresh}
        onAddClick={() => {
          setEditingJob(null);
          setIsModalOpen(true);
        }}
      />

      <JobTable
        jobs={filteredJobs}
        searchQuery={searchQuery}
        onClearSearch={() => setSearchQuery('')}
        onEdit={(job) => {
          setEditingJob(job);
          setIsModalOpen(true);
        }}
        onQuickStatusChange={handleQuickStatusChange}
        onDelete={handleDelete}
      />

      <JobFormModal
        isOpen={isModalOpen}
        editingJob={editingJob}
        programs={programs}
        defaultJobId={autoGenerateJobId(jobs)}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        onSaveAsDraft={handleSaveDraftModal}
      />
    </div>
  );
}
