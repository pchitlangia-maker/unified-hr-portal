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

    // Fetch mappings, programs, users, and roles in parallel to avoid strict relation schema errors
    const [mapRes, progRes, usersRes, rolesRes] = await Promise.all([
      this.client.from('program_user_role_mapping').select('*'),
      this.client.from('programs').select('*'),
      this.client.from('users').select('*'),
      this.client.from('roles').select('*')
    ]);

    if (mapRes.error) throw mapRes.error;
    if (progRes.error) throw progRes.error;
    if (usersRes.error) throw usersRes.error;
    if (rolesRes.error) throw rolesRes.error;

    const progMap = {};
    progRes.data.forEach(p => { progMap[p.id] = p; });

    const usersMap = {};
    usersRes.data.forEach(u => { usersMap[u.user_id] = u; });

    const rolesMap = {};
    rolesRes.data.forEach(r => { rolesMap[r.role_id] = r; });

    const formatted = mapRes.data.map(m => {
      const prog = progMap[m.program_id] || {};
      const usr = usersMap[m.user_id] || {};
      const role = rolesMap[m.role_id] || {};

      return {
        id: m.id,
        program_name: prog.program_name,
        user_email: usr.email,
        mapped_role: role.role,
        status: 'Active'
      };
    });

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

    // Fetch mappings, jobs, and rubrics in parallel to avoid strict relation schema caching errors
    const [mapRes, jobsRes, rubRes] = await Promise.all([
      this.client.from('job_rubric_mapping').select('*'),
      this.client.from('jobs').select('*'),
      this.client.from('rubrics').select('*')
    ]);

    if (mapRes.error) throw mapRes.error;
    if (jobsRes.error) throw jobsRes.error;
    if (rubRes.error) throw rubRes.error;

    const jobsMap = {};
    jobsRes.data.forEach(j => { jobsMap[j.id] = j; });

    const rubMap = {};
    rubRes.data.forEach(r => { rubMap[r.id] = r; });

    return mapRes.data.map(m => {
      const job = jobsMap[m.job_id] || {};
      const rubric = rubMap[m.rubric_id] || {};

      return {
        id: m.id,
        mapping_id: m.mapping_id,
        job_id: job.job_id,
        job_title: job.title,
        rubric_id: rubric.rubric_id,
        rubric_title: rubric.rubric_name,
        status: m.status
      };
    });
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

  // Candidate Screening Helpers (Using parallel client-side mapped joins to avoid strict relationship constraints)
  async getCandidates() {
    if (!this.client) throw new Error('Supabase client not initialized');

    // 1. Fetch raw candidate submission profiles
    const { data: candidatesData, error: cErr } = await this.client
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });
    if (cErr) throw cErr;

    if (!candidatesData || candidatesData.length === 0) return [];

    // 2. Fetch all review rounds and mappings in parallel
    const [r1Res, r2Res, r3Res, jobsRes, usersRes] = await Promise.all([
      this.client.from('r1_reviews').select('*'),
      this.client.from('r2_reviews').select('*'),
      this.client.from('r3_reviews').select('*'),
      this.client.from('jobs').select('*'),
      this.client.from('users').select('*')
    ]);

    if (r1Res.error) throw r1Res.error;
    if (r2Res.error) throw r2Res.error;
    if (r3Res.error) throw r3Res.error;
    if (jobsRes.error) throw jobsRes.error;
    if (usersRes.error) throw usersRes.error;

    // Create maps for efficient O(1) matching
    const r1Map = {};
    r1Res.data.forEach(r => { r1Map[r.candidate_id] = r; });

    const r2Map = {};
    r2Res.data.forEach(r => { r2Map[r.r1_review_id] = r; });

    const r3Map = {};
    r3Res.data.forEach(r => { r3Map[r.r1_review_id] = r; });

    const jobsMap = {};
    jobsRes.data.forEach(j => { jobsMap[j.id] = j; });

    const usersMap = {};
    usersRes.data.forEach(u => { usersMap[u.user_id] = u; });

    // Join and build candidate view objects
    return candidatesData.map(c => {
      const r1 = r1Map[c.candidate_id] || {};
      const r2 = r2Map[r1.id] || {};
      const r3 = r3Map[r1.id] || {};
      const job = jobsMap[r1.job_id] || {};
      const techReviewer = usersMap[r1.assigned_tech_reviewer_id] || {};

      return {
        id: c.candidate_id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        location: c.location,
        education: c.education,
        college: c.college,
        resume_url: c.resume_url,
        github_url: c.github_url,
        linkedin_url: c.linkedin_url,
        demo_url: c.demo_url,
        demo_category: c.demo_category,
        demo_summary: c.demo_summary,
        program_id: job.program_id,
        job_id: r1.job_id,
        job_title: job.title,
        job_code: job.job_id,
        
        // R1 Fields
        r1_review_id: r1.id,
        r1_tier: r1.tier || 'N/A',
        r1_score: Number(r1.score || 0),
        r1_comments: r1.hr_comments,
        r1_status: r1.status || 'Pending',
        assigned_tech_reviewer_id: r1.assigned_tech_reviewer_id,
        assigned_reviewer_email: techReviewer.email,

        // R2 Fields
        r2_earliest_start_date: r2.earliest_start_date || '',
        r2_notice_duration: r2.notice_duration || '',
        r2_comments: r2.comments || '',
        r2_demo_depth: r2.demo_depth || 0,
        r2_complexity: r2.complexity || 0,
        r2_tech_stack: r2.tech_stack || 0,
        r2_business_fit: r2.business_fit || 0,
        r2_decision: r2.decision || 'Pending',

        // R3 Fields
        r3_verdict: r3.verdict || '',
        r3_rejection_comments: r3.rejection_comments || '',
        r3_onboarding_guidelines: r3.onboarding_guidelines || '',
        r3_verdict_tier: r3.verdict_tier || ''
      };
    });
  }

  async saveCandidateR1(candidateId, r1Data) {
    if (!this.client) throw new Error('Supabase client not initialized');

    // First check if r1_review record exists for this candidate
    const { data: existing, error: getErr } = await this.client
      .from('r1_reviews')
      .select('id')
      .eq('candidate_id', candidateId)
      .maybeSingle();
    
    if (getErr) throw getErr;

    const payload = {
      candidate_id: candidateId,
      score: Number(r1Data.r1_score || 0),
      tier: r1Data.r1_tier,
      hr_comments: r1Data.r1_comments,
      status: r1Data.r1_status,
      assigned_tech_reviewer_id: r1Data.assigned_tech_reviewer_id ? parseInt(r1Data.assigned_tech_reviewer_id, 10) : null,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      const { error } = await this.client
        .from('r1_reviews')
        .update(payload)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await this.client
        .from('r1_reviews')
        .insert([payload]);
      if (error) throw error;
    }
    return true;
  }

  async saveCandidateR2(candidateId, r2Data) {
    if (!this.client) throw new Error('Supabase client not initialized');

    // Resolve R1 Review ID
    const { data: r1, error: r1Err } = await this.client
      .from('r1_reviews')
      .select('id')
      .eq('candidate_id', candidateId)
      .single();
    if (r1Err) throw r1Err;

    // Check if r2_reviews record exists
    const { data: existingR2, error: r2FindErr } = await this.client
      .from('r2_reviews')
      .select('id')
      .eq('r1_review_id', r1.id)
      .maybeSingle();
    if (r2FindErr) throw r2FindErr;

    const payload = {
      r1_review_id: r1.id,
      earliest_start_date: r2Data.r2_earliest_start_date || null,
      notice_duration: r2Data.r2_notice_duration,
      comments: r2Data.r2_comments,
      demo_depth: Number(r2Data.r2_demo_depth || 0),
      complexity: Number(r2Data.r2_complexity || 0),
      tech_stack: Number(r2Data.r2_tech_stack || 0),
      business_fit: Number(r2Data.r2_business_fit || 0),
      decision: r2Data.r2_decision,
      updated_at: new Date().toISOString()
    };

    if (existingR2) {
      const { error } = await this.client
        .from('r2_reviews')
        .update(payload)
        .eq('id', existingR2.id);
      if (error) throw error;
    } else {
      const { error } = await this.client
        .from('r2_reviews')
        .insert([payload]);
      if (error) throw error;
    }
    return true;
  }

  async saveCandidateR3(candidateId, r3Data) {
    if (!this.client) throw new Error('Supabase client not initialized');

    // Resolve R1 Review ID
    const { data: r1, error: r1Err } = await this.client
      .from('r1_reviews')
      .select('id')
      .eq('candidate_id', candidateId)
      .single();
    if (r1Err) throw r1Err;

    // Check if r3_reviews record exists
    const { data: existingR3, error: r3FindErr } = await this.client
      .from('r3_reviews')
      .select('id')
      .eq('r1_review_id', r1.id)
      .maybeSingle();
    if (r3FindErr) throw r3FindErr;

    const payload = {
      r1_review_id: r1.id,
      verdict: r3Data.r3_verdict,
      rejection_comments: r3Data.r3_rejection_comments || null,
      onboarding_guidelines: r3Data.r3_onboarding_guidelines || null,
      verdict_tier: r3Data.r3_verdict_tier || null,
      updated_at: new Date().toISOString()
    };

    if (existingR3) {
      const { error } = await this.client
        .from('r3_reviews')
        .update(payload)
        .eq('id', existingR3.id);
      if (error) throw error;
    } else {
      const { error } = await this.client
        .from('r3_reviews')
        .insert([payload]);
      if (error) throw error;
    }
    return true;
  }
}

export const dbService = new HRDatabaseService();
export default dbService;
