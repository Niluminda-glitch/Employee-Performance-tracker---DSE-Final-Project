-- Create ENUM Types
CREATE TYPE public.user_role AS ENUM ('employee', 'supervisor', 'manager');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'first_login');
CREATE TYPE public.skill_proficiency AS ENUM ('learning', 'proficient', 'expert');
CREATE TYPE public.task_status AS ENUM ('pending', 'in-progress', 'completed');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.notification_type AS ENUM ('system', 'task_assigned', 'task_completed', 'deadline_reminder', 'mentorship_request', 'request_approved', 'request_rejected', 'announcement');
CREATE TYPE public.mentorship_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create Departments Table (MUST be created BEFORE users table)
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Users Table (Corrected Version)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'employee',
    status user_status NOT NULL DEFAULT 'active',
    job_title VARCHAR(255),
    department_id UUID REFERENCES public.departments(id), -- CORRECTED: Changed 'department' to 'department_id' and made it a reference
    supervisor_id UUID REFERENCES public.users(id),
    google_id VARCHAR(255) UNIQUE,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert a sample department
INSERT INTO public.departments (id, name, description)
VALUES ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Engineering', 'The department for software and hardware engineers.')
ON CONFLICT (id) DO NOTHING;


-- Create test users and assign them to the sample department
INSERT INTO public.users (email, password, full_name, role, status, department_id)
VALUES (
    'manager@emptrack.test',
    '$2a$10$6Bnv6uDJOxDCxXGxjWF.4.fJFLBuipJ9bKjVJzNHGNQWxHQXGfLOK', -- pw: password123
    'Test Manager',
    'manager',
    'active',
    'a1b2c3d4-e5f6-7890-1234-567890abcdef' -- Assign to Engineering
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (email, password, full_name, role, status, department_id)
VALUES (
    'supervisor@example.com',
    '$2a$10$6Bnv6uDJOxDCxXGxjWF.4.fJFLBuipJ9bKjVJzNHGNQWxHQXGfLOK', -- pw: password123
    'Test Supervisor',
    'supervisor',
    'active',
    'a1b2c3d4-e5f6-7890-1234-567890abcdef' -- Assign to Engineering
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (email, password, full_name, role, status, department_id)
VALUES (
    'employee@example.com',
    '$2a$10$6Bnv6uDJOxDCxXGxjWF.4.fJFLBuipJ9bKjVJzNHGNQWxHQXGfLOK', -- pw: password123
    'Test Employee',
    'employee',
    'active',
    'a1b2c3d4-e5f6-7890-1234-567890abcdef' -- Assign to Engineering
) ON CONFLICT (email) DO NOTHING;