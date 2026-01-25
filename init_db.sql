-- Run this in Supabase SQL Editor

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Colleges Table
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Users Table
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'tpo', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    correct_answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Attempts Table
CREATE TABLE IF NOT EXISTS attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Integrity Logs Table
CREATE TABLE IF NOT EXISTS integrity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'tab_switch', 'blur', 'right_click', etc.
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create TINT Materials Table
CREATE TABLE IF NOT EXISTS tint_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('aptitude', 'logical', 'verbal', 'interview')),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default college and super admin for initial setup (Optional/Manual)
-- INSERT INTO colleges (name) VALUES ('Default Technical College');
