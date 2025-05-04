-- Create ENUM Types
CREATE TYPE public.user_role AS ENUM ('employee', 'supervisor', 'manager');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'first_login');
CREATE TYPE public.skill_proficiency AS ENUM ('learning', 'proficient', 'expert');
CREATE TYPE public.task_status AS ENUM ('pending', 'in-progress', 'completed');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.notification_type AS ENUM ('system', 'task_assigned', 'task_completed', 'deadline_reminder', 'mentorship_request', 'request_approved', 'request_rejected', 'announcement');
CREATE TYPE public.mentorship_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    status user_status NOT NULL DEFAULT 'active',
    job_title VARCHAR(255),
    department VARCHAR(255),
    supervisor_id UUID REFERENCES public.users(id),
    google_id VARCHAR(255) UNIQUE,
    avatar_url VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create test user with hashed password (password: 'password123')
INSERT INTO public.users (id, email, password, name, role, status)
VALUES (
    gen_random_uuid(),
    'test@example.com',
    '$2a$10$6Bnv6uDJOxDCxXGxjWF.4.fJFLBuipJ9bKjVJzNHGNQWxHQXGfLOK', -- bcrypt hash for 'password123'
    'Test User',
    'manager',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Create test supervisor
INSERT INTO public.users (id, email, password, name, role, status)
VALUES (
    gen_random_uuid(),
    'supervisor@example.com',
    '$2a$10$6Bnv6uDJOxDCxXGxjWF.4.fJFLBuipJ9bKjVJzNHGNQWxHQXGfLOK', -- bcrypt hash for 'password123'
    'Test Supervisor',
    'supervisor',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Create test employee
INSERT INTO public.users (id, email, password, name, role, status)
VALUES (
    gen_random_uuid(),
    'employee@example.com',
    '$2a$10$6Bnv6uDJOxDCxXGxjWF.4.fJFLBuipJ9bKjVJzNHGNQWxHQXGfLOK', -- bcrypt hash for 'password123'
    'Test Employee',
    'employee',
    'active'
) ON CONFLICT (email) DO NOTHING;
