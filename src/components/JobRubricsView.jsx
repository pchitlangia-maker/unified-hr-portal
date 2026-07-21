import React, { useState } from 'react';
import { Award, Plus, Edit2, Trash2, X, Search, RotateCw, BookOpen } from 'lucide-react';
import Toast from './common/Toast';

export default function JobRubricsView({ rubrics = [], onSaveRubric, onDeleteRubric }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRubric, setEditingRubric] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Form states
  const [rubricId, setRubricId] = useState('');
  const [rubricName, setRubricName] = useState('');
  
  // Scoring rules text inputs
  const [educationRubric, setEducationRubric] = useState('UG completed=2; PG completed=3; Masters ongoing=2');
  const [experienceRubric, setExperienceRubric] = useState('1 internship=1; 2+ internships=2; Fulltime AI exp=3');
  const [projectRubric, setProjectRubric] = useState('Agentic AI project=2; RAG implementation=2');
  const [artifactRubric, setArtifactRubric] = useState('GitHub=1; Portfolio=1; LinkedIn=0.5');
  const [skillsJson, setSkillsJson] = useState('{"Python":0.5, "LLM":1, "RAG":1, "MCP":1, "Agents":1, "LangChain":0.5}');
  
  // Max Scores per category
  const [maxEducation, setMaxEducation] = useState(5);
  const [maxExperience, setMaxExperience] = useState(5);
  const [maxSkills, setMaxSkills] = useState(5);
  const [maxProject, setMaxProject] = useState(3);
  const [maxArtifact, setMaxArtifact] = useState(2);
  
  const [tierRules, setTierRules] = useState('Tier1>=15; Tier2>=10; Tier3>=5; Tier4<5');

  // Helper to generate sequential auto Rubric ID like RUB001, RUB002
  const autoGenerateRubricId = () => {
    let maxNum = 0;
    rubrics.forEach(r => {
      const match = (r.rubric_id || '').match(/RUB0*(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `RUB${String(nextNum).padStart(3, '0')}`;
  };

  const totalMaxScore = 
    Number(maxEducation || 0) + 
    Number(maxExperience || 0) + 
    Number(maxSkills || 0) + 
    Number(maxProject || 0) + 
    Number(maxArtifact || 0);

  const handleOpenAddModal = () => {
    setEditingRubric(null);
    setRubricId(autoGenerateRubricId());
    setRubricName('');
    setEducationRubric('UG completed=2; PG completed=3; Masters ongoing=2');
    setExperienceRubric('1 internship=1; 2+ internships=2; Fulltime AI exp=3');
    setProjectRubric('Agentic AI project=2; RAG implementation=2');
    setArtifactRubric('GitHub=1; Portfolio=1; LinkedIn=0.5');
    setSkillsJson('{"Python":0.5, "LLM":1, "RAG":1, "MCP":1, "Agents":1, "LangChain":0.5}');
    setMaxEducation(5);
    setMaxExperience(5);
    setMaxSkills(5);
    setMaxProject(3);
    setMaxArtifact(2);
    setTierRules('Tier1>=15; Tier2>=10; Tier3>=5; Tier4<5');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rubric) => {
    setEditingRubric(rubric);
    setRubricId(rubric.rubric_id || 'RUB001');
    setRubricName(rubric.title || rubric.rubric_name || '');
    setEducationRubric(rubric.education_rubric || '');
    setExperienceRubric(rubric.experience_rubric || '');
    setProjectRubric(rubric.project_rubric || rubric.impact_metrics_rubric || '');
    setArtifactRubric(rubric.artifact_rubric || '');
    setSkillsJson(rubric.skills_json || rubric.skills_rubric || '{}');
    setMaxEducation(rubric.education_score || 5);
    setMaxExperience(rubric.experience_score || 5);
    setMaxSkills(rubric.skills_score || 5);
    setMaxProject(rubric.project_score || 3);
    setMaxArtifact(rubric.artifact_score || 2);
    setTierRules(rubric.tier_rules || 'Tier1>=15; Tier2>=10; Tier3>=5; Tier4<5');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rubricName) {
      alert('Please enter a Rubric Name');
      return;
    }

    const payload = {
      rubric_id: rubricId,
      title: rubricName,
      rubric_name: rubricName,
      education_rubric: educationRubric,
      experience_rubric: experienceRubric,
      project_rubric: projectRubric,
      artifact_rubric: artifactRubric,
      skills_json: skillsJson,
      education_score: Number(maxEducation),
      experience_score: Number(maxExperience),
      skills_score: Number(maxSkills),
      project_score: Number(maxProject),
      artifact_score: Number(maxArtifact),
      max_score: totalMaxScore,
      tier_rules: tierRules,
      status: 'Active'
    };

    await onSaveRubric(payload, editingRubric ? editingRubric.id : null);
    setIsModalOpen(false);
    setToastMsg(editingRubric ? 'Rubric criteria updated!' : 'New evaluation rubric created!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDelete = async (rubric) => {
    if (window.confirm(`Are you sure you want to delete rubric "${rubric.title || rubric.rubric_name}"?`)) {
      await onDeleteRubric(rubric.id || rubric.rubric_id);
      setToastMsg('Rubric deleted.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  // Filtered rubrics list
  const filteredRubrics = rubrics.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.rubric_id || '').toLowerCase().includes(q) ||
      (r.title || r.rubric_name || '').toLowerCase().includes(q) ||
      (r.education_rubric || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Toast message={toastMsg} />

      {/* Top Controls Toolbar & Table Header */}
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
                <Award size={22} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                Job Evaluation Rubrics
              </h2>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 2.5rem' }}>
              Build granular grading criteria for deterministic AI screening.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.25rem', height: '40px', fontSize: '0.85rem' }}
                placeholder="Search rubrics, IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Primary Add Rubric Button */}
            <button
              onClick={handleOpenAddModal}
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
              <Plus size={18} /> Add New Rubric
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card (matching Job ID table aesthetic) */}
      <div className="card" style={{ padding: 0, borderRadius: '12px', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="hr-table" style={{ width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-primary-light)' }}>
                <th style={{ width: '120px', textAlign: 'center', fontSize: '0.75rem' }}>RUBRIC ID</th>
                <th style={{ textAlign: 'left', fontSize: '0.75rem' }}>RUBRIC NAME & CRITERIA SUMMARY</th>
                <th style={{ width: '150px', textAlign: 'center', fontSize: '0.75rem' }}>MAX SCORE</th>
                <th style={{ width: '120px', textAlign: 'center', fontSize: '0.75rem' }}>STATUS</th>
                <th style={{ width: '150px', textAlign: 'center', fontSize: '0.75rem' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRubrics.length > 0 ? (
                filteredRubrics.map((rubric) => {
                  const maxPts = rubric.max_score || (
                    Number(rubric.education_score || 0) + 
                    Number(rubric.experience_score || 0) + 
                    Number(rubric.skills_score || 0) + 
                    Number(rubric.project_score || 0) + 
                    Number(rubric.artifact_score || 0)
                  );

                  return (
                    <tr key={rubric.id || rubric.rubric_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {/* RUBRIC ID */}
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
                          {rubric.rubric_id || `RUB00${rubric.id}`}
                        </span>
                      </td>

                      {/* NAME & CRITERIA */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                            {rubric.title || rubric.rubric_name}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Edu: {rubric.education_rubric || 'N/A'} | Exp: {rubric.experience_rubric || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* MAX SCORE */}
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '12px',
                          display: 'inline-block'
                        }}>
                          {maxPts} pts
                        </span>
                      </td>

                      {/* STATUS */}
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.65rem',
                          borderRadius: '12px',
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          display: 'inline-block'
                        }}>
                          {rubric.status || 'Active'}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleOpenEditModal(rubric)}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.775rem' }}
                            title="Edit Rubric Criteria"
                          >
                            <Edit2 size={13} /> Edit
                          </button>

                          <button
                            onClick={() => handleDelete(rubric)}
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
                            title="Delete Rubric"
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
                      <Award size={32} style={{ color: 'var(--color-border)' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>No evaluation rubrics found.</span>
                      <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        <Plus size={16} /> Add First Rubric
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE & EDIT RUBRIC MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '820px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>

            {/* Modal Title Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Award size={24} style={{ color: 'var(--color-primary)' }} />
              <h3 className="modal-title" style={{ margin: 0 }}>
                {editingRubric ? 'Edit Rubric Criteria' : 'Create New Rubric'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Identity Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#E8590C', fontWeight: 700 }}>
                    RUBRIC ID (AUTO-GENERATED) *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={rubricId}
                    readOnly
                    style={{ backgroundColor: 'var(--color-bg-light)', color: 'var(--color-text-muted)', cursor: 'not-allowed', fontWeight: 700 }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#E8590C', fontWeight: 700 }}>
                    RUBRIC NAME *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Agentic AI Builder Standard Rubric"
                    value={rubricName}
                    onChange={(e) => setRubricName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Scoring Rules Row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Education */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-sidebar-text)', display: 'block', marginBottom: '0.5rem' }}>
                    🎓 EDUCATION RUBRIC
                  </span>
                  <label className="form-label" style={{ fontSize: '0.725rem', color: '#E8590C' }}>SCORING RULES *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={educationRubric}
                    onChange={(e) => setEducationRubric(e.target.value)}
                    placeholder="UG completed=2; PG completed=3; Masters ongoing=2"
                    required
                  />
                </div>

                {/* Experience */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-sidebar-text)', display: 'block', marginBottom: '0.5rem' }}>
                    💼 EXPERIENCE RUBRIC
                  </span>
                  <label className="form-label" style={{ fontSize: '0.725rem', color: '#E8590C' }}>SCORING RULES *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={experienceRubric}
                    onChange={(e) => setExperienceRubric(e.target.value)}
                    placeholder="1 internship=1; 2+ internships=2; Fulltime AI exp=3"
                    required
                  />
                </div>
              </div>

              {/* Scoring Rules Row 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Project */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-sidebar-text)', display: 'block', marginBottom: '0.5rem' }}>
                    🚀 PROJECT RUBRIC
                  </span>
                  <label className="form-label" style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>SCORING RULES</label>
                  <input
                    type="text"
                    className="form-input"
                    value={projectRubric}
                    onChange={(e) => setProjectRubric(e.target.value)}
                    placeholder="Agentic AI project=2; RAG implementation=2"
                  />
                </div>

                {/* Artifact */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-sidebar-text)', display: 'block', marginBottom: '0.5rem' }}>
                    ⚙️ ARTIFACT RUBRIC
                  </span>
                  <label className="form-label" style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>SCORING RULES</label>
                  <input
                    type="text"
                    className="form-input"
                    value={artifactRubric}
                    onChange={(e) => setArtifactRubric(e.target.value)}
                    placeholder="GitHub=1; Portfolio=1; LinkedIn=0.5"
                  />
                </div>
              </div>

              {/* Skills Weights JSON */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-sidebar-text)', display: 'block', marginBottom: '0.5rem' }}>
                  ⚡ SKILLS WEIGHTS (JSON)
                </span>
                <textarea
                  className="form-input"
                  rows="2"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  value={skillsJson}
                  onChange={(e) => setSkillsJson(e.target.value)}
                />
                <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  JSON object → skill name → numeric weight. Used for keyword scoring against candidate resume.
                </span>
              </div>

              {/* Max Scores Category Counter */}
              <div style={{ border: '1px solid var(--color-border-warm)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--color-primary-light)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#E8590C', display: 'block', marginBottom: '0.75rem' }}>
                  🏆 MAX SCORES PER CATEGORY
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(5, 1fr)', gap: '0.65rem', textAlign: 'center' }}>
                  {/* TOTAL */}
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-warm)', borderRadius: '8px', padding: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.675rem', fontWeight: 800, color: 'var(--color-sidebar-text)', textTransform: 'uppercase' }}>
                      TOTAL
                    </span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1.1, marginTop: '0.15rem' }}>
                      {totalMaxScore}
                    </span>
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>pts</span>
                  </div>

                  {/* EDUCATION */}
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      EDUCATION
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 800, padding: '0.15rem', marginTop: '0.15rem' }}
                      value={maxEducation}
                      onChange={(e) => setMaxEducation(e.target.value)}
                    />
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>pts</span>
                  </div>

                  {/* EXPERIENCE */}
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      EXPERIENCE
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 800, padding: '0.15rem', marginTop: '0.15rem' }}
                      value={maxExperience}
                      onChange={(e) => setMaxExperience(e.target.value)}
                    />
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>pts</span>
                  </div>

                  {/* SKILLS */}
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      SKILLS
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 800, padding: '0.15rem', marginTop: '0.15rem' }}
                      value={maxSkills}
                      onChange={(e) => setMaxSkills(e.target.value)}
                    />
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>pts</span>
                  </div>

                  {/* PROJECT */}
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      PROJECT
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 800, padding: '0.15rem', marginTop: '0.15rem' }}
                      value={maxProject}
                      onChange={(e) => setMaxProject(e.target.value)}
                    />
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>pts</span>
                  </div>

                  {/* ARTIFACT */}
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      ARTIFACT
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 800, padding: '0.15rem', marginTop: '0.15rem' }}
                      value={maxArtifact}
                      onChange={(e) => setMaxArtifact(e.target.value)}
                    />
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>pts</span>
                  </div>
                </div>
              </div>

              {/* Tier Rules */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  TIER LOGIC THRESHOLDS
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tier1>=15; Tier2>=10; Tier3>=5; Tier4<5"
                  value={tierRules}
                  onChange={(e) => setTierRules(e.target.value)}
                />
              </div>

              {/* Modal Actions Footer */}
              <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRubric ? 'Save & Update Rubric' : 'Create Rubric'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
