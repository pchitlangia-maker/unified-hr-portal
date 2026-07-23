-- ========================================================
-- UNIFIED HR PORTAL - SUPABASE DATABASE MIGRATION SCRIPT
-- Safe Clean-Slate Execution (Runs on empty or existing databases)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. DROP EXISTING TABLES (Child Tables First)
-- --------------------------------------------------------
DROP TABLE IF EXISTS job_rubric_mapping CASCADE;
DROP TABLE IF EXISTS rubrics CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS program_user_role_mapping CASCADE;
DROP TABLE IF EXISTS user_role_mapping CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS programs CASCADE;

DROP SEQUENCE IF EXISTS program_seq CASCADE;
DROP SEQUENCE IF EXISTS job_seq CASCADE;
DROP SEQUENCE IF EXISTS rubric_seq CASCADE;
DROP SEQUENCE IF EXISTS mapping_seq CASCADE;


-- --------------------------------------------------------
-- 2. CREATE SEQUENCE GENERATORS
-- --------------------------------------------------------
CREATE SEQUENCE program_seq START WITH 5 INCREMENT BY 1;
CREATE SEQUENCE job_seq START WITH 4 INCREMENT BY 1;
CREATE SEQUENCE rubric_seq START WITH 2 INCREMENT BY 1;
CREATE SEQUENCE mapping_seq START WITH 2 INCREMENT BY 1;


-- --------------------------------------------------------
-- 3. CREATE TABLES
-- --------------------------------------------------------

-- Programs Table
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    program_id VARCHAR(50) UNIQUE NOT NULL DEFAULT ('PROG' || lpad(nextval('program_seq')::text, 3, '0')),
    program_name VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Roles Table
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role VARCHAR(50) UNIQUE NOT NULL,
    priority INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Global User-Role Mapping Table
CREATE TABLE user_role_mapping (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Program-User-Role Mapping Table (For Program Management Drill-Down)
CREATE TABLE program_user_role_mapping (
    id SERIAL PRIMARY KEY,
    program_id INT REFERENCES programs(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, user_id, role_id)
);

-- Job Openings Table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(50) UNIQUE NOT NULL DEFAULT ('JOB' || lpad(nextval('job_seq')::text, 3, '0')),
    title VARCHAR(150) NOT NULL,
    program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    program_name VARCHAR(150),
    description TEXT,
    roles_responsibilities TEXT,
    desired_skills TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_by VARCHAR(255),
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scoring Rubrics Table
CREATE TABLE rubrics (
    id SERIAL PRIMARY KEY,
    rubric_id VARCHAR(50) UNIQUE NOT NULL DEFAULT ('RUB' || lpad(nextval('rubric_seq')::text, 3, '0')),
    rubric_name VARCHAR(150) NOT NULL,
    education_rules TEXT,
    experience_rules TEXT,
    project_rules TEXT,
    artifact_rules TEXT,
    skills_weights JSONB DEFAULT '{}'::jsonb,
    max_scores JSONB DEFAULT '{"education":5,"experience":5,"skills":5,"project":3,"artifact":2,"total":20}'::jsonb,
    tier_rules TEXT DEFAULT 'Tier1>=15; Tier2>=10; Tier3>=5; Tier4<5',
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job-Rubric Connection Mapping Table
CREATE TABLE job_rubric_mapping (
    id SERIAL PRIMARY KEY,
    mapping_id VARCHAR(50) UNIQUE NOT NULL DEFAULT ('MAP' || lpad(nextval('mapping_seq')::text, 3, '0')),
    job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
    rubric_id INT REFERENCES rubrics(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, rubric_id)
);


-- --------------------------------------------------------
-- 4. SEED INITIAL DATA
-- --------------------------------------------------------

-- Seed Programs
INSERT INTO programs (program_id, program_name) VALUES
('PROG001', 'Aviators'),
('PROG002', 'Techpreneur'),
('PROG003', 'Creatorprenur'),
('PROG004', 'AIprenur');

-- Seed System Roles
INSERT INTO roles (role, priority) VALUES
('Admin', 1),
('Technical Reviewer', 2),
('Recruiter', 3),
('Executive', 4);

-- Seed Users
INSERT INTO users (email, status) VALUES
('amit.sharma@aviators.com', 'active'),
('sara.khan@aviators.com', 'active'),
('deepak.goel@aviators.com', 'inactive');

-- Seed Global User-Role Mappings
INSERT INTO user_role_mapping (user_id, role_id) VALUES
(1, 1), -- amit.sharma -> Admin
(1, 3), -- amit.sharma -> Recruiter
(2, 2), -- sara.khan -> Technical Reviewer
(3, 4); -- deepak.goel -> Executive

-- Seed Program-User-Role Mappings
INSERT INTO program_user_role_mapping (program_id, user_id, role_id) VALUES
(1, 1, 1), -- Aviators -> amit.sharma (Admin)
(1, 2, 2); -- Aviators -> sara.khan (Technical Reviewer)

-- Seed Initial Job Openings
INSERT INTO jobs (job_id, title, program_id, program_name, description, roles_responsibilities, desired_skills, status, created_by, user_id) VALUES
('JOB001', 'Senior AI Engineer', 1, 'Aviators', 'Lead development of agentic coding workflows using LLMs.', 'AI app development, API integration, agent orchestration, chatbot systems.', 'AI, LLM, RAG, Python, LangChain, OpenAI APIs', 'Active', 'amit.sharma@aviators.com', 1),
('JOB002', 'Frontend Developer (React)', 2, 'Techpreneur', 'Design premium responsive interfaces using vanilla CSS and modern components.', 'Build responsive web apps, state management, component architecture.', 'React, JavaScript, HTML5, CSS3, Vite, Tailwind', 'Active', 'amit.sharma@aviators.com', 1),
('JOB003', 'HR Manager', 3, 'Creatorprenur', 'Oversee end-to-end recruitment operations and user role assignments.', 'Recruitment strategy, role definitions, team management.', 'HR Operations, Talent Acquisition, Interviewing, Management', 'Inactive', 'amit.sharma@aviators.com', 1);

-- Seed Sample Rubric
INSERT INTO rubrics (rubric_id, rubric_name, education_rules, experience_rules, project_rules, artifact_rules, skills_weights, status) VALUES
('RUB001', 'Agentic AI Builder Standard Rubric', 'UG completed=2; PG completed=3', '1 internship=1; 2+ internships=2; Fulltime AI exp=3', 'Agentic AI project=2; RAG implementation=2', 'GitHub=1; Portfolio=1; LinkedIn=0.5', '{"Python":0.5, "LLM":1, "RAG":1, "MCP":1}', 'Active');

-- Seed Job-Rubric Mapping
INSERT INTO job_rubric_mapping (mapping_id, job_id, rubric_id, status) VALUES
('MAP001', 1, 1, 'Active');


-- --------------------------------------------------------
-- 5. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
-- --------------------------------------------------------
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_user_role_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_rubric_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access to programs" ON programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to roles" ON roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to user_role_mapping" ON user_role_mapping FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to program_user_role_mapping" ON program_user_role_mapping FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to jobs" ON jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to rubrics" ON rubrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to job_rubric_mapping" ON job_rubric_mapping FOR ALL USING (true) WITH CHECK (true);


-- --------------------------------------------------------
-- 6. CANDIDATES TABLE (Round 1, Round 2, Round 3 Screening Flow)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    ug_university VARCHAR(255),
    resume_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    demo_url TEXT,
    program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    job_id INT REFERENCES jobs(id) ON DELETE SET NULL,
    
    -- Round 1 Recruiter Screening columns
    r1_tier VARCHAR(20) DEFAULT 'N/A',
    r1_score NUMERIC DEFAULT 0,
    r1_comments TEXT,
    r1_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Access requested', 'HR cleared', 'Rejected'
    assigned_tech_reviewer_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Round 2 Technical Reviewer columns
    r2_earliest_start_date DATE,
    r2_notice_duration VARCHAR(100),
    r2_comments TEXT,
    r2_demo_depth NUMERIC DEFAULT 0, -- Product depth slider
    r2_complexity NUMERIC DEFAULT 0,  -- Complexity slider
    r2_tech_stack NUMERIC DEFAULT 0,   -- Tech stack slider
    r2_business_fit NUMERIC DEFAULT 0, -- Business problem slider
    r2_tech_stack_desc TEXT,
    r2_decision VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Yes', 'No', 'Maybe'
    
    -- Round 3 Executive Verdict columns
    r3_verdict VARCHAR(50), -- 'Selected', 'Rejected', 'Maybe'
    r3_rejection_comments TEXT,
    r3_onboarding_guidelines TEXT,
    r3_verdict_tier VARCHAR(50), -- 'Tier 1', 'Tier 2', 'Tier 3'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Candidates
INSERT INTO candidates (name, email, ug_university, resume_url, github_url, demo_url, program_id, job_id, r1_tier, r1_score, r1_status) VALUES
('Rohan Mehta', 'rohan.mehta@gmail.com', 'IIIT Nagpur', 'https://example.com/resume.pdf', 'https://github.com/rohanmehta', 'https://rohan-demo.vercel.app', 1, 1, 'Tier 1', 24, 'Pending'),
('Neha Sharma', 'neha.sharma@gmail.com', 'BITS Pilani', 'https://example.com/resume2.pdf', 'https://github.com/nehasharma', 'https://neha-demo.vercel.app', 1, 1, 'Tier 1+', 28, 'HR cleared'),
('Amit Patel', 'amit.patel@gmail.com', 'VIT Vellore', 'https://example.com/resume3.pdf', 'https://github.com/amitpatel', NULL, 1, 2, 'Tier 2', 18, 'Pending');

-- Enable RLS and Policies for Candidates
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access to candidates" ON candidates FOR ALL USING (true) WITH CHECK (true);

