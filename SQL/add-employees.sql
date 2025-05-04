-- Make sure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, find the supervisor's UUID
-- Run this query and note the UUID:
SELECT id FROM public.users WHERE email = 'supervisor@emptrack.test';

-- Once you have the supervisor's UUID, replace 'd51f962a-c172-4eba-b65e-d2ba90571d21' in the following INSERT statements

-- Insert Employee 1 (assigned to your supervisor)
INSERT INTO public.users
  (id, email, full_name, role, status, password, created_at, updated_at, job_title, supervisor_id, department_id)
VALUES
  (
    uuid_generate_v4(),                 -- Generate new ID for this employee
    'employee1@emptrack.test',          -- Unique email
    'Alice Employee',                   -- Full Name
    'employee',                         -- Role
    'active',                           -- Status
    '$2a$10$Ht.TUza.rVWBjLRZ5Gg9/.IfbROXQCzZ.PFqYHBLwOIuXKfGcKcXa',    -- Hashed password for 'employee123'
    NOW(),                              -- Current timestamp
    NOW(),
    'Stitcher',                         -- Example Job Title
    'd51f962a-c172-4eba-b65e-d2ba90571d21',             -- *** REPLACE with the Supervisor's actual UUID ***
    NULL                                -- Set to NULL or replace with actual department UUID
  );

-- Insert Employee 2 (assigned to the same supervisor)
INSERT INTO public.users
  (id, email, full_name, role, status, password, created_at, updated_at, job_title, supervisor_id, department_id)
VALUES
  (
    uuid_generate_v4(),                 -- Generate new ID
    'employee2@emptrack.test',          -- Unique email
    'Bob Worker',                       -- Full Name
    'employee',                         -- Role
    'active',                           -- Status
    '$2a$10$Ht.TUza.rVWBjLRZ5Gg9/.IfbROXQCzZ.PFqYHBLwOIuXKfGcKcXa',    -- Hashed password for 'worker456'
    NOW(),
    NOW(),
    'Cutter Assistant',                 -- Example Job Title
    'd51f962a-c172-4eba-b65e-d2ba90571d21',             -- *** REPLACE with the Supervisor's actual UUID ***
    NULL                                -- Set to NULL or replace with actual department UUID
  );

-- Insert Employee 3 (assigned to the same supervisor, different dept maybe?)
INSERT INTO public.users
  (id, email, full_name, role, status, password, created_at, updated_at, job_title, supervisor_id, department_id)
VALUES
  (
    uuid_generate_v4(),                 -- Generate new ID
    'employee3@emptrack.test',          -- Unique email
    'Eva Quality',                      -- Full Name
    'employee',                         -- Role
    'active',                           -- Status
    '$2a$10$Ht.TUza.rVWBjLRZ5Gg9/.IfbROXQCzZ.PFqYHBLwOIuXKfGcKcXa',    -- Hashed password for 'quality1'
    NOW(),
    NOW(),
    'QA Assistant',                     -- Example Job Title
    'd51f962a-c172-4eba-b65e-d2ba90571d21',             -- *** REPLACE with the Supervisor's actual UUID ***
    NULL                                -- No department assigned yet
  );

-- Verify Insertion
-- Run this query to see the newly added employees and confirm their supervisor_id:
-- Replace 'd51f962a-c172-4eba-b65e-d2ba90571d21' with the actual supervisor UUID
SELECT id, email, full_name, role, status, supervisor_id
FROM public.users
WHERE role = 'employee' AND supervisor_id = 'd51f962a-c172-4eba-b65e-d2ba90571d21';
