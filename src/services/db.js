import { createClient } from '@supabase/supabase-js';

// Helper to load localStorage with seed data if empty
const initMockDB = () => {
  if (!localStorage.getItem('hr_users')) {
    const seedUsers = [
      { id: 1, email: 'amit.sharma@aviators.com', status: 'active', roles: ['Admin', 'Recruiter'] },
      { id: 2, email: 'sara.khan@aviators.com', status: 'active', roles: ['Technical Reviewer'] },
      { id: 3, email: 'deepak.goel@aviators.com', status: 'inactive', roles: ['Executive'] }
    ];
    localStorage.setItem('hr_users', JSON.stringify(seedUsers));
  }

  if (!localStorage.getItem('hr_roles')) {
    const seedRoles = [
      { id: 1, role: 'Admin', priority: 1 },
      { id: 2, role: 'Technical Reviewer', priority: 2 },
      { id: 3, role: 'Recruiter', priority: 3 },
      { id: 4, role: 'Executive', priority: 4 }
    ];
    localStorage.setItem('hr_roles', JSON.stringify(seedRoles));
  }

  if (!localStorage.getItem('hr_programs')) {
    const seedPrograms = [
      { id: 1, program_id: 'PROG001', program_name: 'Aviators', created_at: new Date().toISOString() },
      { id: 2, program_id: 'PROG002', program_name: 'Techpreneur', created_at: new Date().toISOString() },
      { id: 3, program_id: 'PROG003', program_name: 'Creatorprenur', created_at: new Date().toISOString() },
      { id: 4, program_id: 'PROG004', program_name: 'AIprenur', created_at: new Date().toISOString() }
    ];
    localStorage.setItem('hr_programs', JSON.stringify(seedPrograms));
  }

  if (!localStorage.getItem('hr_jobs')) {
    const seedJobs = [
      { 
        id: 1, 
        job_id: 'JOB001', 
        title: 'Senior AI Engineer', 
        program_name: 'Aviators',
        description: 'Lead development of agentic coding workflows using LLMs.', 
        roles_responsibilities: 'AI app development, API integration, agent orchestration, chatbot systems.',
        desired_skills: 'AI, LLM, RAG, Python, LangChain, OpenAI APIs',
        status: 'Active', 
        created_by: 'amit.sharma@aviators.com', 
        created_at: new Date().toISOString() 
      },
      { 
        id: 2, 
        job_id: 'JOB002', 
        title: 'Frontend Developer (React)', 
        program_name: 'Techpreneur',
        description: 'Design premium responsive interfaces using vanilla CSS and modern components.', 
        roles_responsibilities: 'Build responsive web apps, state management, component architecture.',
        desired_skills: 'React, JavaScript, HTML5, CSS3, Vite, Tailwind',
        status: 'Active', 
        created_by: 'amit.sharma@aviators.com', 
        created_at: new Date().toISOString() 
      },
      { 
        id: 3, 
        job_id: 'JOB003', 
        title: 'HR Manager', 
        program_name: 'Creatorprenur',
        description: 'Oversee end-to-end recruitment operations and user role assignments.', 
        roles_responsibilities: 'Recruitment strategy, role definitions, team management.',
        desired_skills: 'HR Operations, Talent Acquisition, Interviewing, Management',
        status: 'Inactive', 
        created_by: 'amit.sharma@aviators.com', 
        created_at: new Date().toISOString() 
      }
    ];
    localStorage.setItem('hr_jobs', JSON.stringify(seedJobs));
  }

  if (!localStorage.getItem('hr_rubrics')) {
    const seedRubrics = [
      {
        id: 1,
        rubric_id: 'RUB001',
        title: 'Technical Vetting Scorecard',
        education_score: 5,
        experience_score: 10,
        skills_score: 10,
        project_score: 5,
        artifact_score: 0,
        skills_json: '{"AI": 3, "Python": 3, "RAG": 2, "LangChain": 2}',
        tier_rules: 'Tier1>=25; Tier2>=20; Tier3>=15; Tier4<15',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        rubric_id: 'RUB002',
        title: 'Recruiter Resume Screening',
        education_score: 5,
        experience_score: 15,
        skills_score: 5,
        project_score: 5,
        artifact_score: 0,
        skills_json: '{"React": 2, "JavaScript": 2, "HTML": 1}',
        tier_rules: 'Tier1>=25; Tier2>=20; Tier3>=15; Tier4<15',
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('hr_rubrics', JSON.stringify(seedRubrics));
  }

  if (!localStorage.getItem('hr_job_rubric_mappings')) {
    const seedMappings = [
      {
        id: 1,
        mapping_id: 'MAP001',
        job_id: 'JOB001',
        job_title: 'Senior AI Engineer',
        rubric_id: 'RUB001',
        rubric_title: 'Technical Vetting Scorecard',
        status: 'Active',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        mapping_id: 'MAP002',
        job_id: 'JOB002',
        job_title: 'Frontend Developer (React)',
        rubric_id: 'RUB002',
        rubric_title: 'Recruiter Resume Screening',
        status: 'Active',
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('hr_job_rubric_mappings', JSON.stringify(seedMappings));
  }

  if (!localStorage.getItem('hr_program_user_mappings')) {
    const seedProgramUserMappings = [
      { id: 1, program_name: 'Aviators', user_email: 'amit.sharma@aviators.com', mapped_role: 'Admin', status: 'Active', created_at: new Date().toISOString() },
      { id: 2, program_name: 'Aviators', user_email: 'sara.khan@aviators.com', mapped_role: 'Technical Reviewer', status: 'Active', created_at: new Date().toISOString() },
      { id: 3, program_name: 'Techpreneur', user_email: 'amit.sharma@aviators.com', mapped_role: 'Recruiter', status: 'Active', created_at: new Date().toISOString() }
    ];
    localStorage.setItem('hr_program_user_mappings', JSON.stringify(seedProgramUserMappings));
  }
};

initMockDB();

class HRDatabaseService {
  constructor() {
    this.supabaseUrl = localStorage.getItem('supabase_url') || 'https://mujqmdmzloizqhglayxe.supabase.co';
    this.supabaseKey = localStorage.getItem('supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';
    this.useSupabase = localStorage.getItem('use_supabase') === 'true';
    this.client = null;

    if (this.useSupabase && this.supabaseUrl && this.supabaseKey) {
      try {
        this.client = createClient(this.supabaseUrl, this.supabaseKey);
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
      }
    }
  }

  updateConfig(url, key, useSupabase) {
    this.supabaseUrl = url;
    this.supabaseKey = key;
    this.useSupabase = useSupabase;
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    localStorage.setItem('use_supabase', useSupabase ? 'true' : 'false');
    
    if (useSupabase && url && key) {
      this.client = createClient(url, key);
    } else {
      this.client = null;
    }
  }

  // Helper mock methods
  getMockUsers() {
    return JSON.parse(localStorage.getItem('hr_users') || '[]');
  }

  saveMockUsers(users) {
    localStorage.setItem('hr_users', JSON.stringify(users));
  }

  getMockRoles() {
    return JSON.parse(localStorage.getItem('hr_roles') || '[]');
  }

  saveMockRoles(roles) {
    localStorage.setItem('hr_roles', JSON.stringify(roles));
  }

  getMockJobs() {
    return JSON.parse(localStorage.getItem('hr_jobs') || '[]');
  }

  saveMockJobs(jobs) {
    localStorage.setItem('hr_jobs', JSON.stringify(jobs));
  }

  // Unified API
  async getUsers() {
    if (this.useSupabase && this.client) {
      try {
        // Query users with their roles mapped
        const { data: usersData, error: uErr } = await this.client.from('users').select('*');
        if (uErr) throw uErr;

        const { data: mappings, error: mErr } = await this.client
          .from('user_role_mapping')
          .select('user_id, roles(role)');
        if (mErr) throw mErr;

        // Combine
        return usersData.map(u => {
          const userMaps = mappings.filter(m => m.user_id === u.user_id);
          const roles = userMaps.map(m => m.roles?.role).filter(Boolean);
          return {
            id: u.user_id,
            email: u.email,
            status: u.status,
            roles
          };
        });
      } catch (e) {
        console.warn('Supabase fetch users failed. Falling back to local storage.', e);
      }
    }
    return this.getMockUsers();
  }

  async saveUser(email, status, selectedRoles, editingUserId = null) {
    if (this.useSupabase && this.client) {
      try {
        let userId = editingUserId;
        if (editingUserId) {
          const { error } = await this.client
            .from('users')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('user_id', editingUserId);
          if (error) throw error;
        } else {
          const { data, error } = await this.client
            .from('users')
            .insert([{ email, status }])
            .select();
          if (error) throw error;
          userId = data[0].user_id;
        }

        // Delete existing role mappings for user
        const { error: delErr } = await this.client
          .from('user_role_mapping')
          .delete()
          .eq('user_id', userId);
        if (delErr) throw delErr;

        // Fetch target role records to get their IDs
        const { data: rolesData } = await this.client.from('roles').select('role_id, role');
        const mappingsToInsert = selectedRoles.map(rName => {
          const match = rolesData.find(r => r.role === rName);
          return match ? { user_id: userId, role_id: match.role_id } : null;
        }).filter(Boolean);

        if (mappingsToInsert.length > 0) {
          const { error: insErr } = await this.client
            .from('user_role_mapping')
            .insert(mappingsToInsert);
          if (insErr) throw insErr;
        }
        return true;
      } catch (e) {
        console.warn('Supabase save user failed. Falling back to local storage.', e);
      }
    }

    // Mock flow
    const users = this.getMockUsers();
    if (editingUserId) {
      const idx = users.findIndex(u => u.id === editingUserId);
      if (idx !== -1) {
        users[idx].status = status;
        users[idx].roles = selectedRoles;
      }
    } else {
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      users.push({
        id: newId,
        email,
        status,
        roles: selectedRoles
      });
    }
    this.saveMockUsers(users);
    return true;
  }

  async getRoles() {
    if (this.useSupabase && this.client) {
      try {
        const { data, error } = await this.client.from('roles').select('*').order('priority', { ascending: true });
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('Supabase fetch roles failed. Falling back to local storage.', e);
      }
    }
    return this.getMockRoles();
  }

  async saveRole(role, priority, editingRoleId = null) {
    const parsedPriority = parseInt(priority, 10);
    if (this.useSupabase && this.client) {
      try {
        if (editingRoleId) {
          const { data, error } = await this.client
            .from('roles')
            .update({ role, priority: parsedPriority })
            .eq('role_id', editingRoleId)
            .select();
          if (error) throw error;
          return data[0];
        } else {
          const { data, error } = await this.client
            .from('roles')
            .insert([{ role, priority: parsedPriority }])
            .select();
          if (error) throw error;
          return data[0];
        }
      } catch (e) {
        console.warn('Supabase save role failed. Falling back to local storage.', e);
      }
    }

    const roles = this.getMockRoles();
    if (editingRoleId) {
      const idx = roles.findIndex(r => (r.id === editingRoleId || r.role_id === editingRoleId));
      if (idx !== -1) {
        roles[idx].role = role;
        roles[idx].priority = parsedPriority;
      }
    } else {
      const newId = roles.length > 0 ? Math.max(...roles.map(r => r.id || r.role_id || 0)) + 1 : 1;
      const newRole = { id: newId, role, priority: parsedPriority };
      roles.push(newRole);
    }
    // Sort roles by priority
    roles.sort((a, b) => a.priority - b.priority);
    this.saveMockRoles(roles);
    return roles.find(r => r.role === role);
  }

  async updateRolePriorities(reorderedRoles) {
    const updatedWithPriority = reorderedRoles.map((r, index) => ({
      ...r,
      priority: index + 1
    }));

    if (this.useSupabase && this.client) {
      try {
        for (const item of updatedWithPriority) {
          const roleId = item.id || item.role_id;
          if (roleId) {
            await this.client
              .from('roles')
              .update({ priority: item.priority })
              .eq('role_id', roleId);
          }
        }
      } catch (e) {
        console.warn('Supabase update role priorities failed. Falling back to local storage.', e);
      }
    }

    const currentMock = this.getMockRoles();
    updatedWithPriority.forEach(item => {
      const targetId = item.id || item.role_id;
      const match = currentMock.find(m => (m.id === targetId || m.role === item.role));
      if (match) {
        match.priority = item.priority;
      }
    });
    currentMock.sort((a, b) => a.priority - b.priority);
    this.saveMockRoles(currentMock);
    return currentMock;
  }

  async getJobs() {
    if (this.useSupabase && this.client) {
      try {
        const { data, error } = await this.client.from('jobs').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('Supabase fetch jobs failed. Falling back to local storage.', e);
      }
    }
    return this.getMockJobs();
  }

  // Program Mock Helpers
  getMockPrograms() {
    return JSON.parse(localStorage.getItem('hr_programs') || '[]');
  }

  saveMockPrograms(programs) {
    localStorage.setItem('hr_programs', JSON.stringify(programs));
  }

  async getPrograms() {
    if (this.useSupabase && this.client) {
      try {
        const { data, error } = await this.client.from('programs').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('Supabase fetch programs failed. Falling back to local storage.', e);
      }
    }
    return this.getMockPrograms();
  }

  async saveProgram(programName, editingId = null) {
    if (this.useSupabase && this.client) {
      try {
        if (editingId) {
          const { data, error } = await this.client
            .from('programs')
            .update({ program_name: programName })
            .eq('id', editingId)
            .select();
          if (error) throw error;
          return data[0];
        } else {
          const autoProgId = `PROG00${Date.now().toString().slice(-3)}`;
          const { data, error } = await this.client
            .from('programs')
            .insert([{ program_id: autoProgId, program_name: programName }])
            .select();
          if (error) throw error;
          return data[0];
        }
      } catch (e) {
        console.warn('Supabase save program failed. Falling back to local storage.', e);
      }
    }

    const programs = this.getMockPrograms();
    if (editingId) {
      const idx = programs.findIndex(p => p.id === editingId || p.program_id === editingId);
      if (idx !== -1) {
        programs[idx].program_name = programName;
      }
    } else {
      let maxNum = 0;
      programs.forEach(p => {
        const match = (p.program_id || '').match(/PROG0*(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const nextNum = maxNum + 1;
      const newProgId = `PROG${String(nextNum).padStart(3, '0')}`;
      const newNumericId = programs.length > 0 ? Math.max(...programs.map(p => p.id || 0)) + 1 : 1;
      programs.push({
        id: newNumericId,
        program_id: newProgId,
        program_name: programName,
        created_at: new Date().toISOString()
      });
    }
    this.saveMockPrograms(programs);
    return programs;
  }

  async deleteProgram(editingId) {
    if (this.useSupabase && this.client) {
      try {
        await this.client.from('programs').delete().eq('id', editingId);
      } catch (e) {
        console.warn('Supabase delete program failed. Falling back to local storage.', e);
      }
    }

    const programs = this.getMockPrograms().filter(p => p.id !== editingId && p.program_id !== editingId);
    this.saveMockPrograms(programs);
    return true;
  }

  // Program User Mappings
  getMockProgramUserMappings() {
    return JSON.parse(localStorage.getItem('hr_program_user_mappings') || '[]');
  }

  saveMockProgramUserMappings(mappings) {
    localStorage.setItem('hr_program_user_mappings', JSON.stringify(mappings));
  }

  async getProgramUserMappings(programName = null) {
    if (this.useSupabase && this.client) {
      try {
        const { data: rawMappings, error: mErr } = await this.client
          .from('program_user_role_mapping')
          .select('id, programs(program_name), users(email), roles(role)');
        if (mErr) throw mErr;

        const formatted = rawMappings.map(m => ({
          id: m.id,
          program_name: m.programs?.program_name,
          user_email: m.users?.email,
          mapped_role: m.roles?.role,
          status: 'Active'
        }));

        return programName ? formatted.filter(m => m.program_name === programName) : formatted;
      } catch (e) {
        console.warn('Supabase fetch program user mappings failed. Falling back to local storage.', e);
      }
    }
    const all = this.getMockProgramUserMappings();
    return programName ? all.filter(m => m.program_name === programName) : all;
  }

  async addProgramUserMappings(programName, roleName, userEmails) {
    if (this.useSupabase && this.client) {
      try {
        // Fetch program ID
        const { data: progData } = await this.client.from('programs').select('id').eq('program_name', programName).single();
        // Fetch role ID
        const { data: roleData } = await this.client.from('roles').select('role_id').eq('role', roleName).single();
        // Fetch user IDs
        const { data: usersData } = await this.client.from('users').select('user_id, email').in('email', userEmails);

        if (progData && roleData && usersData && usersData.length > 0) {
          const insertPayloads = usersData.map(u => ({
            program_id: progData.id,
            user_id: u.user_id,
            role_id: roleData.role_id
          }));

          const { error } = await this.client.from('program_user_role_mapping').insert(insertPayloads);
          if (error) console.warn('Supabase insert program user role mapping error:', error);
        }
      } catch (e) {
        console.warn('Supabase save program user mappings failed. Falling back to local storage.', e);
      }
    }

    const newItems = userEmails.map(email => ({
      program_name: programName,
      user_email: email,
      mapped_role: roleName,
      status: 'Active',
      created_at: new Date().toISOString()
    }));

    const current = this.getMockProgramUserMappings();
    let maxId = current.length > 0 ? Math.max(...current.map(c => c.id || 0)) : 0;
    newItems.forEach(item => {
      maxId++;
      current.push({ id: maxId, ...item });
    });
    this.saveMockProgramUserMappings(current);
    return current;
  }

  async deleteProgramUserMapping(mappingId) {
    if (this.useSupabase && this.client) {
      try {
        await this.client.from('program_user_role_mapping').delete().eq('id', mappingId);
      } catch (e) {
        console.warn('Supabase delete program user mapping failed. Falling back to local storage.', e);
      }
    }
    const current = this.getMockProgramUserMappings().filter(m => m.id !== mappingId);
    this.saveMockProgramUserMappings(current);
    return true;
  }

  async saveJob(jobData, createdBy, editingId = null) {
    const payload = {
      job_id: jobData.job_id || `JOB00${Date.now().toString().slice(-3)}`,
      title: jobData.title,
      program_name: jobData.program_name || 'Aviators',
      description: jobData.description,
      roles_responsibilities: jobData.roles_responsibilities || '',
      desired_skills: jobData.desired_skills || '',
      status: jobData.status || 'Active',
      updated_at: new Date().toISOString()
    };

    if (this.useSupabase && this.client) {
      try {
        if (editingId) {
          const { data, error } = await this.client
            .from('jobs')
            .update(payload)
            .eq('id', editingId)
            .select();
          if (error) throw error;
          return data[0];
        } else {
          const { data, error } = await this.client
            .from('jobs')
            .insert([{ ...payload, created_by: createdBy, created_at: new Date().toISOString() }])
            .select();
          if (error) throw error;
          return data[0];
        }
      } catch (e) {
        console.warn('Supabase save job failed. Falling back to local storage.', e);
      }
    }

    const jobs = this.getMockJobs();
    if (editingId) {
      const idx = jobs.findIndex(j => j.id === editingId || j.job_id === editingId);
      if (idx !== -1) {
        jobs[idx] = {
          ...jobs[idx],
          ...payload
        };
      }
    } else {
      const newNumericId = jobs.length > 0 ? Math.max(...jobs.map(j => j.id || 0)) + 1 : 1;
      const newJob = {
        id: newNumericId,
        ...payload,
        created_by: createdBy,
        created_at: new Date().toISOString()
      };
      jobs.unshift(newJob);
    }
    this.saveMockJobs(jobs);
    return jobs[0];
  }

  async deleteJob(editingId) {
    if (this.useSupabase && this.client) {
      try {
        await this.client.from('jobs').delete().eq('id', editingId);
      } catch (e) {
        console.warn('Supabase delete job failed. Falling back to local storage.', e);
      }
    }

    const jobs = this.getMockJobs().filter(j => j.id !== editingId && j.job_id !== editingId);
    this.saveMockJobs(jobs);
    return true;
  }

  // Rubrics CRUD
  getMockRubrics() {
    return JSON.parse(localStorage.getItem('hr_rubrics') || '[]');
  }

  saveMockRubrics(rubrics) {
    localStorage.setItem('hr_rubrics', JSON.stringify(rubrics));
  }

  async getRubrics() {
    if (this.useSupabase && this.client) {
      try {
        const { data: rawRubrics, error } = await this.client.from('rubrics').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return rawRubrics.map(r => ({
          ...r,
          title: r.rubric_name || r.title,
          rubric_name: r.rubric_name || r.title,
          education_rubric: r.education_rules || r.education_rubric,
          experience_rubric: r.experience_rules || r.experience_rubric,
          project_rubric: r.project_rules || r.project_rubric,
          artifact_rubric: r.artifact_rules || r.artifact_rubric,
          skills_json: typeof r.skills_weights === 'object' ? JSON.stringify(r.skills_weights, null, 2) : (r.skills_json || '{}'),
          education_score: r.max_scores?.education ?? r.education_score ?? 5,
          experience_score: r.max_scores?.experience ?? r.experience_score ?? 5,
          skills_score: r.max_scores?.skills ?? r.skills_score ?? 5,
          project_score: r.max_scores?.project ?? r.project_score ?? 3,
          artifact_score: r.max_scores?.artifact ?? r.artifact_score ?? 2,
          max_score: r.max_scores?.total ?? r.max_score ?? 20
        }));
      } catch (e) {
        console.warn('Supabase fetch rubrics failed. Falling back to local storage.', e);
      }
    }
    return this.getMockRubrics();
  }

  async saveRubric(rubricData, editingId = null) {
    const payload = {
      rubric_id: rubricData.rubric_id || `RUB00${Date.now().toString().slice(-3)}`,
      title: rubricData.title || rubricData.rubric_name,
      rubric_name: rubricData.rubric_name || rubricData.title,
      education_rubric: rubricData.education_rubric || '',
      experience_rubric: rubricData.experience_rubric || '',
      project_rubric: rubricData.project_rubric || '',
      artifact_rubric: rubricData.artifact_rubric || '',
      skills_rubric: rubricData.skills_rubric || rubricData.skills_json || '',
      education_score: Number(rubricData.education_score || 0),
      experience_score: Number(rubricData.experience_score || 0),
      skills_score: Number(rubricData.skills_score || 0),
      project_score: Number(rubricData.project_score || 0),
      artifact_score: Number(rubricData.artifact_score || 0),
      max_score: Number(rubricData.max_score || 0),
      skills_json: rubricData.skills_json || '{}',
      tier_rules: rubricData.tier_rules || 'Tier1>=15; Tier2>=10; Tier3>=5; Tier4<5',
      status: rubricData.status || 'Active',
      updated_at: new Date().toISOString()
    };

    if (this.useSupabase && this.client) {
      try {
        let skillsJsonObj = {};
        try {
          skillsJsonObj = typeof rubricData.skills_json === 'string' ? JSON.parse(rubricData.skills_json) : (rubricData.skills_json || {});
        } catch(e) {}

        const dbPayload = {
          rubric_name: rubricData.rubric_name || rubricData.title,
          education_rules: rubricData.education_rubric || '',
          experience_rules: rubricData.experience_rubric || '',
          project_rules: rubricData.project_rubric || '',
          artifact_rules: rubricData.artifact_rubric || '',
          skills_weights: skillsJsonObj,
          max_scores: {
            education: Number(rubricData.education_score || 0),
            experience: Number(rubricData.experience_score || 0),
            skills: Number(rubricData.skills_score || 0),
            project: Number(rubricData.project_score || 0),
            artifact: Number(rubricData.artifact_score || 0),
            total: Number(rubricData.max_score || 0)
          },
          tier_rules: rubricData.tier_rules || 'Tier1>=15; Tier2>=10; Tier3>=5; Tier4<5',
          status: rubricData.status || 'Active',
          updated_at: new Date().toISOString()
        };

        if (editingId) {
          const { data, error } = await this.client
            .from('rubrics')
            .update(dbPayload)
            .eq('id', editingId)
            .select();
          if (error) throw error;
          return data[0];
        } else {
          const { data, error } = await this.client
            .from('rubrics')
            .insert([dbPayload])
            .select();
          if (error) throw error;
          return data[0];
        }
      } catch (e) {
        console.warn('Supabase save rubric failed. Falling back to local storage.', e);
      }
    }

    const rubrics = this.getMockRubrics();
    if (editingId) {
      const idx = rubrics.findIndex(r => r.id === editingId || r.rubric_id === editingId);
      if (idx !== -1) {
        rubrics[idx] = { ...rubrics[idx], ...payload };
      }
    } else {
      const newId = rubrics.length > 0 ? Math.max(...rubrics.map(r => r.id || 0)) + 1 : 1;
      rubrics.unshift({ id: newId, ...payload, created_at: new Date().toISOString() });
    }
    this.saveMockRubrics(rubrics);
    return rubrics[0];
  }

  async deleteRubric(editingId) {
    if (this.useSupabase && this.client) {
      try {
        await this.client.from('rubrics').delete().eq('id', editingId);
      } catch (e) {
        console.warn('Supabase delete rubric failed. Falling back to local storage.', e);
      }
    }
    const rubrics = this.getMockRubrics().filter(r => r.id !== editingId && r.rubric_id !== editingId);
    this.saveMockRubrics(rubrics);
    return true;
  }

  // Job-Rubric Mappings CRUD
  getMockJobRubricMappings() {
    return JSON.parse(localStorage.getItem('hr_job_rubric_mappings') || '[]');
  }

  saveMockJobRubricMappings(mappings) {
    localStorage.setItem('hr_job_rubric_mappings', JSON.stringify(mappings));
  }

  async getJobRubricMappings() {
    if (this.useSupabase && this.client) {
      try {
        const { data: rawMappings, error: mErr } = await this.client
          .from('job_rubric_mapping')
          .select('id, mapping_id, status, jobs(job_id, title), rubrics(rubric_id, rubric_name, title)')
          .order('created_at', { ascending: false });
        if (mErr) throw mErr;

        return rawMappings.map(m => ({
          id: m.id,
          mapping_id: m.mapping_id,
          job_id: m.jobs?.job_id,
          job_title: m.jobs?.title,
          rubric_id: m.rubrics?.rubric_id,
          rubric_title: m.rubrics?.rubric_name || m.rubrics?.title,
          status: m.status
        }));
      } catch (e) {
        console.warn('Supabase fetch job rubric mappings failed. Falling back to local storage.', e);
      }
    }
    return this.getMockJobRubricMappings();
  }

  async saveJobRubricMapping(mappingData, editingId = null) {
    if (this.useSupabase && this.client) {
      try {
        const { data: jobRec } = await this.client.from('jobs').select('id').or(`job_id.eq.${mappingData.job_id},id.eq.${mappingData.job_id}`).single();
        const { data: rubRec } = await this.client.from('rubrics').select('id').or(`rubric_id.eq.${mappingData.rubric_id},id.eq.${mappingData.rubric_id}`).single();

        if (jobRec && rubRec) {
          const dbPayload = {
            job_id: jobRec.id,
            rubric_id: rubRec.id,
            status: mappingData.status || 'Active'
          };

          if (editingId) {
            await this.client.from('job_rubric_mapping').update(dbPayload).eq('id', editingId);
          } else {
            await this.client.from('job_rubric_mapping').insert([dbPayload]);
          }
        }
      } catch (e) {
        console.warn('Supabase save job rubric mapping failed. Falling back to local storage.', e);
      }
    }

    const payload = {
      mapping_id: mappingData.mapping_id || `MAP00${Date.now().toString().slice(-3)}`,
      job_id: mappingData.job_id,
      job_title: mappingData.job_title,
      rubric_id: mappingData.rubric_id,
      rubric_title: mappingData.rubric_title,
      status: mappingData.status || 'Active',
      updated_at: new Date().toISOString()
    };

    const mappings = this.getMockJobRubricMappings();
    if (editingId) {
      const idx = mappings.findIndex(m => m.id === editingId || m.mapping_id === editingId);
      if (idx !== -1) {
        mappings[idx] = { ...mappings[idx], ...payload };
      }
    } else {
      const newId = mappings.length > 0 ? Math.max(...mappings.map(m => m.id || 0)) + 1 : 1;
      mappings.unshift({ id: newId, ...payload, created_at: new Date().toISOString() });
    }
    this.saveMockJobRubricMappings(mappings);
    return mappings[0];
  }

  async deleteJobRubricMapping(editingId) {
    if (this.useSupabase && this.client) {
      try {
        await this.client.from('job_rubric_mapping').delete().eq('id', editingId);
      } catch (e) {
        console.warn('Supabase delete job rubric mapping failed. Falling back to local storage.', e);
      }
    }
    const mappings = this.getMockJobRubricMappings().filter(m => m.id !== editingId && m.mapping_id !== editingId);
    this.saveMockJobRubricMappings(mappings);
    return true;
  }
}

export const dbService = new HRDatabaseService();
export default dbService;
