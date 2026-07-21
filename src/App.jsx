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
  ToggleLeft
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
import ConfigModal from './components/ConfigModal';

// Predefined simulator users matching the mockup data
const SIMULATED_USERS = [
  { email: 'amit.sharma@aviators.com', name: 'Amit Sharma (Admin)', status: 'active', roles: ['Admin', 'Recruiter'] },
  { email: 'sara.khan@aviators.com', name: 'Sara Khan (Reviewer)', status: 'active', roles: ['Technical Reviewer'] },
  { email: 'deepak.goel@aviators.com', name: 'Deepak Goel (Inactive)', status: 'inactive', roles: ['Executive'] },
  { email: 'unassigned@aviators.com', name: 'Guest / Unmapped', status: 'active', roles: [] }
];

export default function App() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [programMappings, setProgramMappings] = useState([]);
  const [activeProgram, setActiveProgram] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [jobRubricMappings, setJobRubricMappings] = useState([]);
  const [activeTab, setActiveTab] = useState('user-mapping');
  const [simulatedUser, setSimulatedUser] = useState(SIMULATED_USERS[0]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
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
      setUsers(u);
      setRoles(r);
      setPrograms(p);
      setProgramMappings(pm);
      setJobs(j);
      setRubrics(rub);
      setJobRubricMappings(m);
      setDbModeName('Supabase Live DB');
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const renderActiveView = () => {
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
      default:
        return <UserMappingView users={users} roles={roles} onSaveUser={handleSaveUser} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <h1 className="logo-title">AVIATORS</h1>
          <div className="logo-subtitle">Dynamic Screening Hub</div>
        </div>

        <div className="sidebar-divider" />

        <nav>
          <ul className="nav-list">
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
