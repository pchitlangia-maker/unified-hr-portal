import { createClient } from '@supabase/supabase-js';

class HRDatabaseService {
  constructor() {
    this.supabaseUrl = localStorage.getItem('supabase_url') || 'https://kxpddfiecemvlhxpdpzv.supabase.co';
    this.supabaseKey = localStorage.getItem('supabase_key') || 'sb_publishable_TuFZJmSCS4K-tuXo-zfKTQ_zMmhXz8A';
    this.useSupabase = true;
    this.client = null;

    try {
      if (this.supabaseUrl && this.supabaseKey) {
        this.client = createClient(this.supabaseUrl, this.supabaseKey);
      }
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
  }

  updateConfig(url, key, useSupabase) {
    this.supabaseUrl = url;
    this.supabaseKey = key;
    this.useSupabase = true;
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    localStorage.setItem('use_supabase', 'true');
    
    if (url && key) {
      this.client = createClient(url, key);
    } else {
      this.client = null;
    }
  }

  // Unified API
  async getUsers() {
    if (!this.client) throw new Error('Supabase client not initialized');

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
  }

  async saveUser(email, status, selectedRoles, editingUserId = null) {
    if (!this.client) throw new Error('Supabase client not initialized');

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
    const { data: rolesData, error: rErr } = await this.client.from('roles').select('role_id, role');
    if (rErr) throw rErr;

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
  }

  async getRoles() {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client.from('roles').select('*').order('priority', { ascending: true });
    if (error) throw error;
    return data;
  }

  async saveRole(role, priority, editingRoleId = null) {
    if (!this.client) throw new Error('Supabase client not initialized');

    const parsedPriority = parseInt(priority, 10);
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
  }

  async updateRolePriorities(reorderedRoles) {
    if (!this.client) throw new Error('Supabase client not initialized');

    const updatedWithPriority = reorderedRoles.map((r, index) => ({
      ...r,
      priority: index + 1
    }));

    for (const item of updatedWithPriority) {
      const roleId = item.id || item.role_id;
      if (roleId) {
        const { error } = await this.client
          .from('roles')
          .update({ priority: item.priority })
          .eq('role_id', roleId);
        if (error) throw error;
      }
    }
    return updatedWithPriority;
  }

  async getJobs() {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client.from('jobs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getPrograms() {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data, error } = await this.client.from('programs').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async saveProgram(programName, editingId = null) {
    if (!this.client) throw new Error('Supabase client not initialized');

    if (editingId) {
      const { data, error } = await this.client
        .from('programs')
        .update({ program_name: programName })
        .eq('id', editingId)
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await this.client
        .from('programs')
        .insert([{ program_name: programName }])
        .select();
      if (error) throw error;
      return data[0];
    }
  }

  async deleteProgram(editingId) {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { error } = await this.client.from('programs').delete().eq('id', editingId);
    if (error) throw error;
    return true;
  }

  async getProgramUserMappings(programName = null) {
    if (!this.client) throw new Error('Supabase client not initialized');

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
  }

  async addProgramUserMappings(programName, roleName, userEmails) {
    if (!this.client) throw new Error('Supabase client not initialized');

    // Fetch program ID
    const { data: progData, error: pErr } = await this.client.from('programs').select('id').eq('program_name', programName).single();
    if (pErr) throw pErr;
    // Fetch role ID
    const { data: roleData, error: rErr } = await this.client.from('roles').select('role_id').eq('role', roleName).single();
    if (rErr) throw rErr;
    // Fetch user IDs
    const { data: usersData, error: uErr } = await this.client.from('users').select('user_id, email').in('email', userEmails);
    if (uErr) throw uErr;

    if (progData && roleData && usersData && usersData.length > 0) {
      const insertPayloads = usersData.map(u => ({
        program_id: progData.id,
        user_id: u.user_id,
        role_id: roleData.role_id
      }));

      const { error } = await this.client.from('program_user_role_mapping').insert(insertPayloads);
      if (error) throw error;
    }
    return true;
  }

  async deleteProgramUserMapping(mappingId) {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { error } = await this.client.from('program_user_role_mapping').delete().eq('id', mappingId);
    if (error) throw error;
    return true;
  }

  async saveJob(jobData, createdBy, editingId = null) {
    if (!this.client) throw new Error('Supabase client not initialized');

    // Resolve program_id from program_name
    let programId = null;
    if (jobData.program_name) {
      const { data: prog } = await this.client.from('programs').select('id').eq('program_name', jobData.program_name).maybeSingle();
      if (prog) programId = prog.id;
    }

    // Resolve user_id from createdBy
    let userId = null;
    if (createdBy) {
      const { data: usr } = await this.client.from('users').select('user_id').eq('email', createdBy).maybeSingle();
      if (usr) userId = usr.user_id;
    }

    const payload = {
      title: jobData.title,
      program_id: programId,
      program_name: jobData.program_name || 'Aviators',
      description: jobData.description,
      roles_responsibilities: jobData.roles_responsibilities || '',
      desired_skills: jobData.desired_skills || '',
      status: jobData.status || 'Active',
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    if (editingId) {
      payload.job_id = jobData.job_id;
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
  }

  async deleteJob(editingId) {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { error } = await this.client.from('jobs').delete().eq('id', editingId);
    if (error) throw error;
    return true;
  }

  async getRubrics() {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data: rawRubrics, error } = await this.client.from('rubrics').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    return rawRubrics.map(r => ({
      ...r,
      title: r.rubric_name,
      rubric_name: r.rubric_name,
      education_rubric: r.education_rules || '',
      experience_rubric: r.experience_rules || '',
      project_rubric: r.project_rules || '',
      artifact_rubric: r.artifact_rules || '',
      skills_json: typeof r.skills_weights === 'object' ? JSON.stringify(r.skills_weights, null, 2) : (r.skills_weights || '{}'),
      education_score: r.max_scores?.education ?? 5,
      experience_score: r.max_scores?.experience ?? 5,
      skills_score: r.max_scores?.skills ?? 5,
      project_score: r.max_scores?.project ?? 3,
      artifact_score: r.max_scores?.artifact ?? 2,
      max_score: r.max_scores?.total ?? 20
    }));
  }

  async saveRubric(rubricData, editingId = null) {
    if (!this.client) throw new Error('Supabase client not initialized');

    let skillsJsonObj = {};
    if (rubricData.skills_json) {
      try {
        skillsJsonObj = typeof rubricData.skills_json === 'string' ? JSON.parse(rubricData.skills_json) : (rubricData.skills_json || {});
      } catch (e) {
        console.warn('Failed to parse skills_json:', e);
      }
    }

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
      dbPayload.rubric_id = rubricData.rubric_id;
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
  }

  async deleteRubric(editingId) {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { error } = await this.client.from('rubrics').delete().eq('id', editingId);
    if (error) throw error;
    return true;
  }

  async getJobRubricMappings() {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { data: rawMappings, error: mErr } = await this.client
      .from('job_rubric_mapping')
      .select('id, mapping_id, status, jobs(job_id, title), rubrics(rubric_id, rubric_name)')
      .order('created_at', { ascending: false });
    if (mErr) throw mErr;

    return rawMappings.map(m => ({
      id: m.id,
      mapping_id: m.mapping_id,
      job_id: m.jobs?.job_id,
      job_title: m.jobs?.title,
      rubric_id: m.rubrics?.rubric_id,
      rubric_title: m.rubrics?.rubric_name,
      status: m.status
    }));
  }

  async saveJobRubricMapping(mappingData, editingId = null) {
    if (!this.client) throw new Error('Supabase client not initialized');

    // Resolve job ID without causing PostgreSQL integer cast error if it is a string like 'JOB001'
    let jobQuery = this.client.from('jobs').select('id');
    const isJobIdString = typeof mappingData.job_id === 'string' && mappingData.job_id.startsWith('JOB');
    if (isJobIdString) {
      jobQuery = jobQuery.eq('job_id', mappingData.job_id);
    } else {
      jobQuery = jobQuery.eq('id', parseInt(mappingData.job_id, 10));
    }
    const { data: jobRec, error: jErr } = await jobQuery.maybeSingle();
    if (jErr) throw jErr;

    // Resolve rubric ID without causing PostgreSQL integer cast error if it is a string like 'RUB001'
    let rubQuery = this.client.from('rubrics').select('id');
    const isRubricIdString = typeof mappingData.rubric_id === 'string' && mappingData.rubric_id.startsWith('RUB');
    if (isRubricIdString) {
      rubQuery = rubQuery.eq('rubric_id', mappingData.rubric_id);
    } else {
      rubQuery = rubQuery.eq('id', parseInt(mappingData.rubric_id, 10));
    }
    const { data: rubRec, error: rErr } = await rubQuery.maybeSingle();
    if (rErr) throw rErr;

    if (jobRec && rubRec) {
      const dbPayload = {
        job_id: jobRec.id,
        rubric_id: rubRec.id,
        status: mappingData.status || 'Active'
      };

      if (editingId) {
        dbPayload.mapping_id = mappingData.mapping_id;
        const { error } = await this.client
          .from('job_rubric_mapping')
          .update(dbPayload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await this.client
          .from('job_rubric_mapping')
          .insert([dbPayload]);
        if (error) throw error;
      }
    } else {
      throw new Error(`Could not resolve job_id (${mappingData.job_id}) or rubric_id (${mappingData.rubric_id}) to database keys.`);
    }
    return true;
  }

  async deleteJobRubricMapping(editingId) {
    if (!this.client) throw new Error('Supabase client not initialized');

    const { error } = await this.client
      .from('job_rubric_mapping')
      .delete().eq('id', editingId);
    if (error) throw error;
    return true;
  }
}

export const dbService = new HRDatabaseService();
export default dbService;
