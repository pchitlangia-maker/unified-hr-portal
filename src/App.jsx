import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Briefcase, 
  Award, 
  Layers,
  Link2,
  Database,
  UserCheck,
  ToggleLeft,
  Flame,
  ClipboardList
} from 'lucide-react';
import dbService from './services/db';
import UserMappingView from './components/UserMappingView';
import RoleMappingView from './components/RoleMappingView';
import JobOpeningView from './components/JobOpeningView';
import ProgramManagementView from './components/ProgramManagementView';
import ProgramDrillDownView from './components/ProgramDrillDownView';
import JobRubricsView from './components/JobRubricsView';
import JobRubricMappingView from './components/JobRubricMappingView';
import RoleGuard from './components/RoleGuard';

// Modular Screening Imports
import Round1ReviewDashboard from './components/r1/Round1ReviewDashboard';
import CandidateDetailReview from './components/r1/CandidateDetailReview';
import Round2TechnicalReview from './components/r2/Round2TechnicalReview';
import CandidateTechnicalReview from './components/r2/CandidateTechnicalReview';
import Round3ExecutiveReview from './components/r3/Round3ExecutiveReview';

// Predefined simulator users matching the mockup data
const SIMULATED_USERS = [
  { email: 'amit.sharma@aviators.com', name: 'Amit Sharma (Admin & Recruiter)', status: 'active', roles: ['Admin', 'Recruiter'] },
  { email: 'sara.khan@aviators.com', name: 'Sara Khan (Reviewer)', status: 'active', roles: ['Technical Reviewer'] },
  { email: 'deepak.goel@aviators.com', name: 'Deepak Goel (Executive)', status: 'active', roles: ['Executive'] },
  { email: 'unassigned@aviators.com', name: 'Guest / Unmapped', status: 'active', roles: [] }
];

export default function App() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [programMappings, setProgramMappings] = useState([]);
  const [activeProgram, setActiveProgram] = useState(null);
  const [selectedHeaderProgramId, setSelectedHeaderProgramId] = useState('ALL');
  const [jobs, setJobs] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [jobRubricMappings, setJobRubricMappings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  
  // Screening workflow detail view selection states
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [activeTab, setActiveTab] = useState('user-mapping');
  const [simulatedUser, setSimulatedUser] = useState(SIMULATED_USERS[0]);
  const [activeRole, setActiveRole] = useState('Admin');
  const [dbModeName, setDbModeName] = useState('Supabase Live DB');

  // Load all DB data
  const loadData = async () => {
    try {
      const u = await dbService.getUsers();
      const r = await dbService.getRoles();
      const p = await dbService.getPrograms();
      const pm = await dbService.getProgramUserMappings();
      const j = await dbService.getJobs();
      const rub = await dbService.getRubrics();
      const m = await dbService.getJobRubricMappings();
      const c = await dbService.getCandidates();

      setUsers(u);
      setRoles(r);
      setPrograms(p);
      setProgramMappings(pm);
      setJobs(j);
      setRubrics(rub);
      setJobRubricMappings(m);
      setCandidates(c);
      setDbModeName('Supabase Live DB');
    } catch (e) {
      console.error('Error loading data in App.jsx:', e);
      if (e && typeof e === 'object') {
        console.error('Detailed Error Keys:', Object.keys(e));
        console.error('Detailed Error Msg:', e.message || JSON.stringify(e));
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update activeRole when simulated user changes
  useEffect(() => {
    if (simulatedUser.roles && simulatedUser.roles.length > 0) {
      // Pick first role as default activeRole
      setActiveRole(simulatedUser.roles[0]);
    } else {
      setActiveRole('');
    }
  }, [simulatedUser]);

  // Update default tab based on switched role
  useEffect(() => {
    if (activeRole === 'Admin') {
      setActiveTab('user-mapping');
    } else if (activeRole === 'Recruiter') {
      setActiveTab('r1-dashboard');
    } else if (activeRole === 'Technical Reviewer') {
      setActiveTab('r2-dashboard');
    } else if (activeRole === 'Executive') {
      setActiveTab('r3-dashboard');
    }
    setSelectedCandidate(null);
  }, [activeRole]);

  // Update simulator when users list modifies
  useEffect(() => {
    const matched = users.find(u => u.email === simulatedUser.email);
    if (matched) {
      setSimulatedUser(matched);
    } else {
      const defaultMockUser = SIMULATED_USERS.find(u => u.email === simulatedUser.email);
      if (defaultMockUser) {
        setSimulatedUser({
          email: defaultMockUser.email,
          status: defaultMockUser.status,
          roles: defaultMockUser.roles
        });
      }
    }
  }, [users]);

  const handleSimulateUserChange = (email) => {
    const found = users.find(u => u.email === email);
    if (found) {
      setSimulatedUser(found);
    } else {
      const mockObj = SIMULATED_USERS.find(u => u.email === email);
      setSimulatedUser({
        email: mockObj.email,
        status: mockObj.status,
        roles: mockObj.roles
      });
    }
  };

  const handleSaveUser = async (email, status, selectedRoles, userId) => {
    await dbService.saveUser(email, status, selectedRoles, userId);
    await loadData();
  };

  const handleSaveRole = async (roleName, priority, roleId = null) => {
    await dbService.saveRole(roleName, priority, roleId);
    await loadData();
  };

  const handleUpdateRolePriorities = async (reorderedRoles) => {
    await dbService.updateRolePriorities(reorderedRoles);
    await loadData();
  };

  const handleSaveProgram = async (programName, editingId = null) => {
    await dbService.saveProgram(programName, editingId);
    await loadData();
  };

  const handleDeleteProgram = async (programId) => {
    await dbService.deleteProgram(programId);
    await loadData();
  };

  const handleAddProgramUserMappings = async (programName, roleName, userEmails) => {
    await dbService.addProgramUserMappings(programName, roleName, userEmails);
    await loadData();
  };

  const handleDeleteProgramUserMapping = async (mappingId) => {
    await dbService.deleteProgramUserMapping(mappingId);
    await loadData();
  };

  const handleSaveJob = async (jobData, editingId = null) => {
    await dbService.saveJob(jobData, simulatedUser.email, editingId);
    await loadData();
  };

  const handleDeleteJob = async (jobId) => {
    await dbService.deleteJob(jobId);
    await loadData();
  };

  const handleSaveRubric = async (rubricData, editingId = null) => {
    await dbService.saveRubric(rubricData, editingId);
    await loadData();
  };

  const handleDeleteRubric = async (rubricId) => {
    await dbService.deleteRubric(rubricId);
    await loadData();
  };

  const handleSaveJobRubricMapping = async (mappingData, editingId = null) => {
    await dbService.saveJobRubricMapping(mappingData, editingId);
    await loadData();
  };

  const handleDeleteJobRubricMapping = async (mappingId) => {
    await dbService.deleteJobRubricMapping(mappingId);
    await loadData();
  };

  // Screening Save Handlers
  const handleSaveCandidateR1 = async (candidateId, payload) => {
    await dbService.saveCandidateR1(candidateId, payload);
    setSelectedCandidate(null);
    await loadData();
  };

  const handleSaveCandidateR2 = async (candidateId, payload) => {
    await dbService.saveCandidateR2(candidateId, payload);
    setSelectedCandidate(null);
    await loadData();
  };

  const handleSaveCandidateR3 = async (candidateId, payload) => {
    await dbService.saveCandidateR3(candidateId, payload);
    setSelectedCandidate(null);
    await loadData();
  };

  // Scoped Program list mapped to simulated user
  const getUserScopedPrograms = () => {
    if (activeRole === 'Admin') return programs;
    
    // Find programs mapped to simulatedUser's email in program_user_role_mapping
    const mappedProgramNames = programMappings
      .filter(m => m.user_email === simulatedUser.email)
      .map(m => m.program_name);

    return programs.filter(p => mappedProgramNames.includes(p.program_name));
  };

  const userScopedPrograms = getUserScopedPrograms();

  const getFilteredCandidates = () => {
    let result = candidates;
    if (selectedHeaderProgramId !== 'ALL') {
      result = result.filter(c => String(c.program_id) === String(selectedHeaderProgramId));
    }
    return result;
  };

  const filteredCandidates = getFilteredCandidates();

  const renderActiveView = () => {
    // Block render if user has no assigned roles
    if (!simulatedUser.roles || simulatedUser.roles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-red-100 rounded-[2rem] shadow-sm text-center">
          <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Access Restrained</h3>
          <p className="text-sm text-muted-foreground">Admin hasn't mapped any role to your user ID, kindly contact the Admin.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'user-mapping':
        return <UserMappingView users={users} roles={roles} onSaveUser={handleSaveUser} />;
      case 'role-mapping':
        return <RoleMappingView roles={roles} onSaveRole={handleSaveRole} onUpdatePriorities={handleUpdateRolePriorities} />;
      case 'program-management':
        if (activeProgram) {
          return (
            <ProgramDrillDownView 
              program={activeProgram}
              users={users}
              roles={roles}
              programMappings={programMappings}
              onBack={() => setActiveProgram(null)}
              onAddMappings={handleAddProgramUserMappings}
              onDeleteMapping={handleDeleteProgramUserMapping}
            />
          );
        }
        return (
          <ProgramManagementView 
            programs={programs} 
            onSaveProgram={handleSaveProgram} 
            onDeleteProgram={handleDeleteProgram}
            onSelectProgram={(prog) => setActiveProgram(prog)}
          />
        );
      case 'job-opening':
        return (
          <JobOpeningView 
            jobs={jobs} 
            programs={programs}
            onSaveJob={handleSaveJob} 
            onDeleteJob={handleDeleteJob}
            onRefresh={loadData}
            activeUserEmail={simulatedUser.email} 
          />
        );
      case 'job-rubrics':
        return (
          <JobRubricsView 
            rubrics={rubrics} 
            onSaveRubric={handleSaveRubric} 
            onDeleteRubric={handleDeleteRubric} 
          />
        );
      case 'job-rubrics-mapping':
        return (
          <JobRubricMappingView 
            mappings={jobRubricMappings} 
            jobs={jobs} 
            rubrics={rubrics} 
            onSaveMapping={handleSaveJobRubricMapping} 
            onDeleteMapping={handleDeleteJobRubricMapping} 
          />
        );

      // Round 1 Recruiter Workflow
      case 'r1-dashboard':
        if (selectedCandidate) {
          return (
            <CandidateDetailReview
              candidate={selectedCandidate}
              reviewers={users.filter(u => u.roles?.includes('Technical Reviewer'))}
              onSave={handleSaveCandidateR1}
              onCancel={() => setSelectedCandidate(null)}
            />
          );
        }
        return (
          <Round1ReviewDashboard
            candidates={filteredCandidates}
            jobs={jobs}
            onSelectCandidate={(c) => setSelectedCandidate(c)}
          />
        );

      // Round 2 Technical Reviewer Workflow
      case 'r2-dashboard':
        if (selectedCandidate) {
          return (
            <CandidateTechnicalReview
              candidate={selectedCandidate}
              onSave={handleSaveCandidateR2}
              onCancel={() => setSelectedCandidate(null)}
            />
          );
        }
        // Show candidates where R1 cleared, and assigned technical reviewer matches simulatedUser user_id
        const simulatedUserId = users.find(u => u.email === simulatedUser.email)?.user_id;
        const myCandidates = filteredCandidates.filter(c => 
          c.r1_status === 'HR cleared' && c.assigned_tech_reviewer_id === simulatedUserId
        );
        return (
          <Round2TechnicalReview
            candidates={myCandidates}
            onSelectCandidate={(c) => setSelectedCandidate(c)}
          />
        );

      // Round 3 Executive Workflow
      case 'r3-dashboard':
        return (
          <Round3ExecutiveReview
            candidates={filteredCandidates}
            onSaveVerdict={handleSaveCandidateR3}
          />
        );

      default:
        return <UserMappingView users={users} roles={roles} onSaveUser={handleSaveUser} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <h1 className="logo-title" style={{ fontSize: '1.25rem', lineHeight: 1.2 }}>UNIFIED HR PORTAL</h1>
          <div className="logo-subtitle">Dynamic Screening Hub</div>
        </div>

        <div className="sidebar-divider" />

        <nav>
          <ul className="nav-list">
            {/* Admin Side Options */}
            {activeRole === 'Admin' && (
              <>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'user-mapping' ? 'active' : ''}`}
                    onClick={() => setActiveTab('user-mapping')}
                  >
                    <Users size={18} /> User Mapping
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'role-mapping' ? 'active' : ''}`}
                    onClick={() => setActiveTab('role-mapping')}
                  >
                    <ShieldCheck size={18} /> Role Mapping
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'program-management' ? 'active' : ''}`}
                    onClick={() => setActiveTab('program-management')}
                  >
                    <Layers size={18} /> Program Management
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'job-opening' ? 'active' : ''}`}
                    onClick={() => setActiveTab('job-opening')}
                  >
                    <Briefcase size={18} /> Job Opening
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'job-rubrics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('job-rubrics')}
                  >
                    <Award size={18} /> Job Rubrics
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'job-rubrics-mapping' ? 'active' : ''}`}
                    onClick={() => setActiveTab('job-rubrics-mapping')}
                  >
                    <Link2 size={18} /> Job Rubrics Mapping
                  </button>
                </li>
              </>
            )}

            {/* Recruiter Options */}
            {activeRole === 'Recruiter' && (
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'r1-dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('r1-dashboard')}
                >
                  <ClipboardList size={18} /> R1: Recruiter Review
                </button>
              </li>
            )}

            {/* Technical Reviewer Options */}
            {activeRole === 'Technical Reviewer' && (
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'r2-dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('r2-dashboard')}
                >
                  <Flame size={18} /> R2: Technical Review
                </button>
              </li>
            )}

            {/* Executive Options */}
            {activeRole === 'Executive' && (
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'r3-dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('r3-dashboard')}
                >
                  <Award size={18} /> R3: Executive Verdict
                </button>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Simulation Sandbox Toolbar */}
        <div className="sim-toolbar">
          <div className="sim-info">
            <ToggleLeft size={16} />
            <span>Active Sandbox Mode:</span>
            <span className="sim-badge">{dbModeName}</span>
          </div>

          <div className="sim-controls">
            {/* Program Header Filter (Scoped to mapped programs of active user) */}
            {simulatedUser.roles && simulatedUser.roles.length > 0 && (
              <div className="sim-selector">
                <Layers size={16} />
                <span>Program Scope:</span>
                <select 
                  className="sim-select text-xs font-semibold"
                  value={selectedHeaderProgramId}
                  onChange={(e) => setSelectedHeaderProgramId(e.target.value)}
                >
                  <option value="ALL">All Programs</option>
                  {userScopedPrograms.map(p => (
                    <option key={p.id} value={p.id}>{p.program_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Role Switcher (Visible if user has more than 1 role) */}
            {simulatedUser.roles && simulatedUser.roles.length > 1 && (
              <div className="sim-selector">
                <ShieldCheck size={16} />
                <span>Active Role Switcher:</span>
                <select 
                  className="sim-select text-xs font-semibold"
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value)}
                >
                  {simulatedUser.roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Simulated User Login Switcher */}
            <div className="sim-selector">
              <UserCheck size={16} />
              <span>Simulate User Login:</span>
              <select 
                className="sim-select"
                value={simulatedUser.email}
                onChange={(e) => handleSimulateUserChange(e.target.value)}
              >
                {SIMULATED_USERS.map(su => (
                  <option key={su.email} value={su.email}>{su.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Top Header */}
        <header className="top-header">
          <h2 className="header-title">
            {activeTab === 'user-mapping' && 'User Mapping'}
            {activeTab === 'role-mapping' && 'Role Mapping'}
            {activeTab === 'program-management' && 'Program Management'}
            {activeTab === 'job-opening' && 'Job Opening'}
            {activeTab === 'job-rubrics' && 'Job Rubrics'}
            {activeTab === 'job-rubrics-mapping' && 'Job Rubrics Mapping'}
            {activeTab === 'r1-dashboard' && 'R1 Recruiter Screening Queue'}
            {activeTab === 'r2-dashboard' && 'R2 Technical Vetting Queue'}
            {activeTab === 'r3-dashboard' && 'R3 Executive Master Control Dashboard'}
          </h2>

          <div className="user-badge">
            <span>Logged as: <strong>{simulatedUser.email}</strong></span>
            {simulatedUser.roles && simulatedUser.roles.length > 0 && (
              <span style={{ 
                fontSize: '0.75rem', 
                backgroundColor: 'var(--color-primary-light)', 
                color: 'var(--color-primary)', 
                padding: '0.15rem 0.5rem', 
                borderRadius: '4px',
                fontWeight: 600
              }}>
                {simulatedUser.roles.join(', ')}
              </span>
            )}
          </div>
        </header>

        {/* Main Content Layout wrapped in RoleGuard */}
        <main className="content-body">
          <RoleGuard user={simulatedUser}>
            {renderActiveView()}
          </RoleGuard>
        </main>
      </div>
    </div>
  );
}
