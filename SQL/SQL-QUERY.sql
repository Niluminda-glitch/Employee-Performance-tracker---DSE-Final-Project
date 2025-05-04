SELECT * FROM public.departments;



-- Create ENUM Types (if they don't exist)
DO $$ BEGIN CREATE TYPE public.user_role AS ENUM ('employee', 'supervisor', 'manager'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'first_login'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.skill_proficiency AS ENUM ('learning', 'proficient', 'expert'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.task_status AS ENUM ('pending', 'in-progress', 'completed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.notification_type AS ENUM ('system', 'task_assigned', 'task_completed', 'deadline_reminder', 'mentorship_request', 'request_approved', 'request_rejected', 'announcement'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.mentorship_status AS ENUM ('pending', 'accepted', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;



-- Enable UUID generation if not already enabled (usually needed once per DB)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Preferred modern UUID functions
-- Or CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Alternative if uuid-ossp isn't available

-- Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), -- Use uuid_generate_v4() or gen_random_uuid()
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL -- timestamptz stores timezone
);
COMMENT ON TABLE public.departments IS 'Stores department information';

-- Users Table (Public Profile Data)
-- IMPORTANT: Assumes you have a separate auth system (like Supabase Auth or custom) that manages the actual authentication credentials.
-- This table stores publicly accessible profile data linked by the auth user ID.
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY NOT NULL, -- MUST match the ID from your authentication system (e.g., auth.users.id)
  email text UNIQUE NOT NULL,
  full_name text,
  role user_role NOT NULL DEFAULT 'employee', -- Default role applied here
  status user_status NOT NULL DEFAULT 'first_login',
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  supervisor_id uuid REFERENCES public.users(id) ON DELETE SET NULL, -- Self-referencing FK
  avatar_url text,
  password text NOT NULL, -- ADDED: Need this for custom login logic if NOT using separate auth system
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.users IS 'Stores public user profile information (and password hash for custom auth)';
COMMENT ON COLUMN public.users.id IS 'Should match the ID from the primary authentication system/table if separate';
COMMENT ON COLUMN public.users.password IS 'Stores the hashed password for custom authentication';


select * from skills;

-- Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.skills IS 'Stores available skills in the organization';

-- User Skills Table (Join Table)
CREATE TABLE IF NOT EXISTS public.user_skills (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level skill_proficiency NOT NULL DEFAULT 'learning',
  willing_to_mentor boolean NOT NULL DEFAULT false,
  is_certified boolean NOT NULL DEFAULT false,
  last_certified_date date,
  is_training boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, skill_id) -- Composite primary key
);
COMMENT ON TABLE public.user_skills IS 'Associates users with skills and their proficiency/mentorship status';

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  assignee_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  supervisor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Task creator/owner
  status task_status NOT NULL DEFAULT 'pending',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date date,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.tasks IS 'Stores task information';

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type notification_type NOT NULL,
  related_task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  related_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.notifications IS 'Stores user notifications';

-- Mentorship Requests Table
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  status mentorship_status NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.mentorship_requests IS 'Tracks mentorship requests between users for specific skills';




----------------------------------------------------------------------------------------------------------------------




-- Indices for users table
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_supervisor_id ON public.users(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Indices for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_supervisor_id ON public.tasks(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Indices for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, is_read);

-- Indices for mentorship_requests table
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_requester_id ON public.mentorship_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor_id ON public.mentorship_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_status ON public.mentorship_requests(status);

-----------------------------------------------------------------------------------------------------------------

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
      NEW.updated_at = timezone('utc', now());
   END IF;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users; -- Drop first if exists
CREATE TRIGGER handle_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS handle_tasks_updated_at ON public.tasks; -- Drop first if exists
CREATE TRIGGER handle_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS handle_mentorship_requests_updated_at ON public.mentorship_requests; -- Drop first if exists
CREATE TRIGGER handle_mentorship_requests_updated_at BEFORE UPDATE ON public.mentorship_requests FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();


----------------------------------------------------------------------------------------------------------------------------------



-- === Departments ===
INSERT INTO public.departments (id, name) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Cutting'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef0', 'Sewing Line A');

-- === Users ===
INSERT INTO public.users (id, email, full_name, role, status, department_id, password) VALUES
('c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'alice@emptrack.test', 'Alice Employee', 'employee', 'active', 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', '$2b$10$V1u6lV6Xefh7QjNd1VFE0eA9uH.vD/rC9nMBwv0g7bGgbN1NcGuIS'), 
('d4e5f6a7-b8c9-0123-4567-890abcdef012', 'supervisor@emptrack.test', 'Charlie Supervisor', 'supervisor', 'active', 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', '$2b$10$MwQIXIHTJYjehNRG5cDPMeVFxEUBFZ5HK0i.m3Vpz.BVRpMd7E0u6'), 
('e5f6a7b8-c9d0-1234-5678-90abcdef0123', 'manager@emptrack.test', 'Max Manager', 'manager', 'active', NULL, '$2b$10$F1SeYKbE8zLILRb3TJhe1.zNsdrpWhdkZFSN63mZVPcJ8UTmt0Iie');

-- === Assign Supervisor (Example) ===
UPDATE public.users SET supervisor_id = 'd4e5f6a7-b8c9-0123-4567-890abcdef012' WHERE id = 'c3d4e5f6-a7b8-9012-3456-7890abcdef01';

-- === Skills ===
INSERT INTO public.skills (id, name, description) VALUES
('f6a7b8c9-d0e1-2345-6789-0abcdef01234', 'Lockstitch Operation', 'Operating standard lockstitch sewing machines.'),
('a7b8c9d0-e1f2-3456-7890-bcdef0123456', 'Fabric Cutting', 'Operating automated or manual fabric cutting equipment.');

-- === User Skills ===
INSERT INTO public.user_skills (user_id, skill_id, proficiency_level, willing_to_mentor) VALUES
('c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'f6a7b8c9-d0e1-2345-6789-0abcdef01234', 'proficient', true),
('d4e5f6a7-b8c9-0123-4567-890abcdef012', 'f6a7b8c9-d0e1-2345-6789-0abcdef01234', 'expert', true),
('d4e5f6a7-b8c9-0123-4567-890abcdef012', 'a7b8c9d0-e1f2-3456-7890-bcdef0123456', 'learning', false),
('e5f6a7b8-c9d0-1234-5678-90abcdef0123', 'f6a7b8c9-d0e1-2345-6789-0abcdef01234', 'learning', false);


------------------------------------------------------------------------------------------------------------------

ALTER TABLE public.users
ADD COLUMN job_title TEXT NULL; -- Or TEXT NOT NULL if required

COMMENT ON COLUMN public.users.job_title IS 'Stores the job title of the user';


ALTER TABLE public.users
ADD COLUMN google_id TEXT NULL UNIQUE; -- TEXT stores the Google ID string, NULL if not logged in via Google, UNIQUE ensures only one user per Google ID

COMMENT ON COLUMN public.users.google_id IS 'Stores the unique ID from Google Sign-In';


select * from public.users;

INSERT INTO public.users (id, email, full_name, role, status, department_id, password) VALUES
('a3d4e5f6-a7b8-9012-3456-7890abcdef01', 'kavishka@emptrack.test', 'Kavishka Niluminda', 'employee', 'active', 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', 'kavishka');

-- SQL script to update password for kavishka@emptrack.test
UPDATE public.users 
SET password = '$2a$10$8ikir04Qlsu8NQDuGV7dDesVXDObh1L5FXcuh8pn38ftQJQj5njO6' 
WHERE email = 'kavishka@emptrack.test';



-- Connect to your emptrack_db database first!

-- Delete potential manager rows
DELETE FROM public.users
WHERE email IN ('manager@emptrack.test', 'manager@example.com');

-- Delete potential supervisor rows
DELETE FROM public.users
WHERE email IN ('supervisor@emptrack.test', 'supervisor@example.com', 'charlie@example.com');

-- Optional: Verify deletion
SELECT id, email, role FROM public.users;




--------------------------------------------------------------------------------------------------------------



-- Make sure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert Supervisor
INSERT INTO public.users
  (id, email, full_name, role, status, password, created_at, updated_at, job_title)
VALUES
  (uuid_generate_v4(),
   'supervisor@emptrack.test',
   'Test Supervisor',
   'supervisor',
   'active',
   '$2a$10$4eB94jNjgVvTN3tm2MpnDuZUoekuMUoUXxAwmbMTYRv5xzHLEf..W',  -- Hashed password for 'supervisor123'
   NOW(),
   NOW(),
   'Line Supervisor'
  );

-- Insert Manager
INSERT INTO public.users
  (id, email, full_name, role, status, password, created_at, updated_at, job_title)
VALUES
  (uuid_generate_v4(),
   'manager@emptrack.test',
   'Test Manager',
   'manager',
   'active',
   '$2a$10$sNWFH.btj6zwiHY4SA18oeYXl4ZX4HzlhusiFsJZ.O08VqVttZ/Qm',  -- Hashed password for 'manager123'
   NOW(),
   NOW(),
   'Factory Manager'
  );

-- Verify insertion
SELECT id, email, role, status, password FROM public.users
WHERE role IN ('supervisor', 'manager');


SELECT id FROM public.users WHERE email = 'supervisor@emptrack.test';




--------------------------------------------------------------------------------------

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

INSERT INTO public.tasks
  (id, title, description, assignee_id, supervisor_id, status, priority, due_date)
VALUES
  (
    uuid_generate_v4(),
    'Prepare Monthly Sales Report',
    'Compile and summarize the sales data for April.',
    (SELECT id FROM public.users WHERE email = 'kavishka@emptrack.test'), -- Assign to Kavishka
    (SELECT id FROM public.users WHERE email = 'supervisor@emptrack.test'), -- Assigned by supervisor
    'pending',
    'medium',
    '2025-05-05'
  ),
  (
    uuid_generate_v4(),
    'Update Employee Records',
    'Ensure all employee information is current in the HR system.',
    (SELECT id FROM public.users WHERE email = 'kavishka@emptrack.test'),
    (SELECT id FROM public.users WHERE email = 'supervisor@emptrack.test'),
    'pending',
    'high',
    '2025-05-12'
  ),
  (
    uuid_generate_v4(),
    'Organize Team Meeting',
    'Set up a meeting to discuss Q2 goals and plans.',
    (SELECT id FROM public.users WHERE email = 'kavishka@emptrack.test'),
    (SELECT id FROM public.users WHERE email = 'supervisor@emptrack.test'),
    'pending',
    'low',
    '2025-05-08'
  );


---------------------------------------------------------------------------------------------------------------

INSERT INTO public.tasks
  (id, title, description, assignee_id, supervisor_id, status, priority, due_date)
VALUES
  (
    uuid_generate_v4(),
    'Prepare Cut Fabric for Style ABC',
    'Bundle 50 units of main body pieces.',
    (SELECT id FROM public.users WHERE email = 'employee1@emptrack.test'), -- Assign to employee1
    (SELECT id FROM public.users WHERE email = 'supervisor@emptrack.test'), -- Assigned by supervisor
    'pending',
    'high',
    '2025-05-10' -- Example due date
  ),
  (
    uuid_generate_v4(),
    'Inspect Stitching Quality - Line A',
    'Perform hourly checks on 10 random garments.',
    (SELECT id FROM public.users WHERE email = 'employee2@emptrack.test'), -- Assign to employee2
    (SELECT id FROM public.users WHERE email = 'supervisor@emptrack.test'), -- Assigned by supervisor
    'in-progress',
    'medium',
    NULL -- No specific due date
  ),
  (
    uuid_generate_v4(),
    'Review Production Schedule',
    'Update the production schedule for next week.',
    (SELECT id FROM public.users WHERE email = 'employee3@emptrack.test'), -- Assign to employee3
    (SELECT id FROM public.users WHERE email = 'supervisor@emptrack.test'), -- Assigned by supervisor
    'pending',
    'low',
    '2025-05-15' -- Example due date
  ),
  (
    uuid_generate_v4(),
    'Quality Check - Finished Products',
    'Perform final quality check on finished products.',
    (SELECT id FROM public.users WHERE email = 'employee1@emptrack.test'), -- Assign to employee1
    (SELECT id FROM public.users WHERE email = 'supervisor@emptrack.test'), -- Assigned by supervisor
    'completed',
    'high',
    '2025-05-05' -- Example due date
  );

-- Verify insertion
SELECT t.id, t.title, t.status, t.priority, t.due_date, 
       a.full_name as assignee_name, s.full_name as supervisor_name
FROM public.tasks t
LEFT JOIN public.users a ON t.assignee_id = a.id
LEFT JOIN public.users s ON t.supervisor_id = s.id;


SELECT * FROM public.users;

SELECT assignee_id, supervisor_id
FROM public.tasks
WHERE id = 'f7e18b3b-7829-455c-a560-5b5e06d30d75'; -- Use the exact task ID from the error


SELECT
  t.id AS task_id,
  t.title,
  t.description,
  t.status,
  t.priority,
  t.due_date,
  t.created_at AS task_created_at,
  t.supervisor_id,
  u_supervisor.full_name AS supervisor_name -- Get supervisor's name
FROM
  public.tasks t -- Alias tasks table as 't'
LEFT JOIN
  public.users u_supervisor ON t.supervisor_id = u_supervisor.id -- Join based on supervisor_id
WHERE
  t.assignee_id = 'a3d4e5f6-a7b8-9012-3456-7890abcdef01'; -- Kavishka's UUID






SELECT id FROM public.users WHERE email = 'supervisor@emptrack.test'; --d51f962a-c172-4eba-b65e-d2ba90571d21

SELECT id FROM public.users WHERE email = 'kavishka@emptrack.test'; --a3d4e5f6-a7b8-9012-3456-7890abcdef01

UPDATE public.users
SET supervisor_id = 'd51f962a-c172-4eba-b65e-d2ba90571d21' -- Paste supervisor's UUID here
WHERE id = 'a3d4e5f6-a7b8-9012-3456-7890abcdef01';             -- Paste Kavishka's UUID here


-------------------------------------------------------------------------------------------------------------

-- Connect to emptrack_db first

-- Create Operations Table
CREATE TABLE IF NOT EXISTS public.operations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), -- Primary Key
    name text NOT NULL,                            -- Human-readable name (e.g., "Style 12B - Pocket Set")
    operation_number text UNIQUE,                  -- Optional: Unique code/number (e.g., "OP-101")
    description text,                              -- Optional: Longer description of the operation
    -- Store checkpoints as an array of objects in JSONB
    quality_checkpoints jsonb DEFAULT '[]'::jsonb, -- Array like: [{"icon": "stitch", "text": "Check tension"}, {"icon": "ruler", "text": "Verify alignment"}]
    smv_target numeric(5, 2),                      -- Standard Minute Value (e.g., 1.15 allows up to 999.99) - Allow NULL if not applicable
    sop_url text,                                  -- URL to Standard Operating Procedure document
    video_url text,                                -- URL to instructional video
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.operations IS 'Stores details about specific work operations or styles for contextual assistance.';
COMMENT ON COLUMN public.operations.operation_number IS 'Unique code identifying the operation/style.';
COMMENT ON COLUMN public.operations.quality_checkpoints IS 'JSON array of objects detailing key quality checks. e.g., [{"icon": "icon-name", "text": "Description"}]';
COMMENT ON COLUMN public.operations.smv_target IS 'Standard Minute Value (target time per unit) for this operation.';
COMMENT ON COLUMN public.operations.sop_url IS 'Link to the Standard Operating Procedure document.';
COMMENT ON COLUMN public.operations.video_url IS 'Link to an instructional video.';

-- Add Index on operation_number for faster lookups if used often
CREATE INDEX IF NOT EXISTS idx_operations_operation_number ON public.operations(operation_number);

-- Apply the updated_at trigger (assuming the function update_updated_at_column exists)
DROP TRIGGER IF EXISTS handle_operations_updated_at ON public.operations; -- Drop first if exists
CREATE TRIGGER handle_operations_updated_at BEFORE UPDATE ON public.operations FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();



-------------------------------------------------------------------------------------------------------------------
drop table public.operations;

-- operations Table (Example Schema)
CREATE TABLE IF NOT EXISTS public.operations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL, -- e.g., "Pocket Setting - Style 45A"
  number text UNIQUE, -- e.g., "OP-101", optional but useful identifier
  -- Store checkpoints as JSON array of objects
  quality_checkpoints jsonb DEFAULT '[]'::jsonb,
  smv_target numeric(5, 2), -- e.g., 1.25 minutes (5 digits total, 2 after decimal)
  sop_url text, -- URL to Standard Operating Procedure doc/video
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.operations IS 'Stores details about specific work operations or tasks';
COMMENT ON COLUMN public.operations.quality_checkpoints IS 'JSON array of objects like [{"icon":"stitch", "text":"Check tension"}, ...]';
COMMENT ON COLUMN public.operations.smv_target IS 'Standard Minute Value target for the operation';

-- Apply the updated_at trigger
DROP TRIGGER IF EXISTS handle_operations_updated_at ON public.operations;
CREATE TRIGGER handle_operations_updated_at BEFORE UPDATE ON public.operations FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Index on operation number if used frequently
CREATE INDEX IF NOT EXISTS idx_operations_number ON public.operations(number);


--------------------------------------------------------------------------------------------------------------

-- Insert Sample Operations (Generate real UUIDs)
INSERT INTO public.operations (id, name, number, quality_checkpoints, smv_target, sop_url) VALUES
(
    uuid_generate_v4(),
    'Pocket Setting - Style 45A',
    'OP-101',
    '[
        {"icon":"ruler", "text":"Verify placement +/- 2mm"},
        {"icon":"stitch", "text":"Ensure straight top stitch"},
        {"icon":"clean", "text":"Check for oil spots"}
    ]',
    1.15,
    'https://example.com/sops/style45a-pocket.pdf'
),
(
    uuid_generate_v4(),
    'Sleeve Attachment - Style 45A',
    'OP-105',
    '[
        {"icon":"align", "text":"Match notches accurately"},
        {"icon":"stitch", "text":"No puckering at curve"},
        {"icon":"scissors", "text":"Trim threads inside"}
    ]',
    2.50,
    'https://example.com/sops/style45a-sleeve.mp4'
),
(
    uuid_generate_v4(),
    'Collar Topstitch - Style 88B',
    'OP-210',
    '[
        {"icon":"stitch", "text":"Maintain even stitch margin (3mm)"},
        {"icon":"symmetry", "text":"Check point symmetry"},
        {"icon":"clean", "text":"Press collar flat, no shine"}
    ]',
    0.90,
    'https://example.com/sops/style88b-collar.pdf'
);

------------------------------------------------------------------------------------------------------------------------------------


-- Ensure you are connected to the correct database (e.g., emptrack_db)

-- Insert a larger set of skills relevant to the apparel industry
-- Using ON CONFLICT to avoid errors if some skills already exist (based on name)

INSERT INTO public.skills (id, name, description, "createdAt", "updatedAt") VALUES
  -- Core Sewing Machine Operations
  ('f6a7b8c9-d0e1-2345-6789-0abcdef01234', 'Lockstitch Operation', 'Operating standard lockstitch sewing machines for seaming.', NOW(), NOW()), -- Your existing skill
  (gen_random_uuid(), 'Overlock/Serger Operation', 'Operating overlock machines for edge finishing and seaming stretch fabrics.', NOW(), NOW()),
  (gen_random_uuid(), 'Coverstitch Operation', 'Operating coverstitch machines for hemming and topstitching knits.', NOW(), NOW()),
  (gen_random_uuid(), 'Buttonhole Machine Operation', 'Operating automated buttonhole machines.', NOW(), NOW()),
  (gen_random_uuid(), 'Button Attachment Machine', 'Operating machines for attaching buttons.', NOW(), NOW()),
  (gen_random_uuid(), 'Bartack Machine Operation', 'Operating bartack machines for reinforcing stress points.', NOW(), NOW()),
  (gen_random_uuid(), 'Flatlock Machine Operation', 'Operating flatlock machines for decorative or functional flat seams.', NOW(), NOW()),
  (gen_random_uuid(), 'Blind Stitch Machine Operation', 'Operating blind stitch machines for invisible hemming.', NOW(), NOW()),

  -- Cutting Room Skills
  ('a7b8c9d0-e1f2-3456-7890-bcdef0123456', 'Fabric Cutting', 'Operating automated or manual fabric cutting equipment.', NOW(), NOW()), -- Your existing skill
  (gen_random_uuid(), 'Fabric Spreading', 'Laying out multiple plies of fabric accurately for cutting.', NOW(), NOW()),
  (gen_random_uuid(), 'Marker Making', 'Creating efficient cutting layouts (markers), manually or using CAD.', NOW(), NOW()),
  (gen_random_uuid(), 'Plotting', 'Operating plotters to print markers.', NOW(), NOW()),
  (gen_random_uuid(), 'Die Cutting', 'Using die cutting machines for specific shapes.', NOW(), NOW()),
  (gen_random_uuid(), 'Fabric Inspection (Cutting)', 'Identifying fabric flaws before cutting.', NOW(), NOW()),

  -- Pattern & Design Skills
  (gen_random_uuid(), 'Pattern Making (Manual)', 'Drafting patterns using traditional tools.', NOW(), NOW()),
  (gen_random_uuid(), 'Pattern Making (CAD)', 'Using CAD software (e.g., Lectra, Gerber, Optitex) for pattern creation.', NOW(), NOW()),
  (gen_random_uuid(), 'Pattern Grading', 'Scaling base patterns to different sizes.', NOW(), NOW()),
  (gen_random_uuid(), 'Draping', 'Creating patterns by draping fabric on a dress form.', NOW(), NOW()),
  (gen_random_uuid(), 'Technical Sketching', 'Creating detailed flat sketches for production.', NOW(), NOW()),
  (gen_random_uuid(), 'Tech Pack Creation', 'Developing comprehensive technical packages for manufacturing.', NOW(), NOW()),

  -- Finishing & Pressing Skills
  (gen_random_uuid(), 'Garment Pressing/Ironing', 'Using industrial irons and presses for finishing.', NOW(), NOW()),
  (gen_random_uuid(), 'Steam Tunnel Operation', 'Using steam tunnels for wrinkle removal.', NOW(), NOW()),
  (gen_random_uuid(), 'Folding & Bagging', 'Preparing finished garments for shipping.', NOW(), NOW()),
  (gen_random_uuid(), 'Label & Tag Attachment', 'Attaching brand labels, care labels, and hang tags.', NOW(), NOW()),
  (gen_random_uuid(), 'Spot Cleaning', 'Removing stains or marks from finished garments.', NOW(), NOW()),
  (gen_random_uuid(), 'Trimming Threads', 'Cleaning loose threads from garments.', NOW(), NOW()),

  -- Quality Control Skills
  (gen_random_uuid(), 'Stitch Quality Inspection', 'Evaluating seam quality, tension, and consistency.', NOW(), NOW()),
  (gen_random_uuid(), 'Measurement Checking', 'Verifying garment dimensions against specifications.', NOW(), NOW()),
  (gen_random_uuid(), 'Fabric Quality Control', 'Identifying fabric defects like holes, stains, or inconsistencies.', NOW(), NOW()),
  (gen_random_uuid(), 'Inline Quality Checking (Sewing)', 'Inspecting garments during the sewing process.', NOW(), NOW()),
  (gen_random_uuid(), 'Final Quality Inspection (AQL)', 'Performing Acceptable Quality Limit inspections on finished goods.', NOW(), NOW()),
  (gen_random_uuid(), 'Color Matching', 'Assessing color consistency across garments and batches.', NOW(), NOW()),

  -- Specialized Skills
  (gen_random_uuid(), 'Embroidery Machine Operation', 'Operating single or multi-head embroidery machines.', NOW(), NOW()),
  (gen_random_uuid(), 'Screen Printing', 'Applying designs using screen printing techniques.', NOW(), NOW()),
  (gen_random_uuid(), 'Heat Transfer Application', 'Applying heat transfers or vinyl graphics.', NOW(), NOW()),
  (gen_random_uuid(), 'Garment Dyeing', 'Operating garment dyeing equipment.', NOW(), NOW()),
  (gen_random_uuid(), 'Laser Cutting/Engraving (Textiles)', 'Using laser machines for cutting or etching fabric.', NOW(), NOW()),
  (gen_random_uuid(), 'Pleating', 'Creating pleats using specialized equipment or manually.', NOW(), NOW()),
  (gen_random_uuid(), 'Seam Sealing', 'Applying waterproof tape to seams.', NOW(), NOW()),

  -- Material Knowledge
  (gen_random_uuid(), 'Knit Fabric Handling', 'Specific techniques for working with stretchy knit fabrics.', NOW(), NOW()),
  (gen_random_uuid(), 'Woven Fabric Handling', 'Specific techniques for working with stable woven fabrics.', NOW(), NOW()),
  (gen_random_uuid(), 'Leather/Suede Handling', 'Techniques for sewing and handling leather materials.', NOW(), NOW()),
  (gen_random_uuid(), 'Denim Processing', 'Knowledge of washing, finishing, and sewing denim.', NOW(), NOW()),

  -- Maintenance & Technical
  (gen_random_uuid(), 'Sewing Machine Basic Maintenance', 'Performing routine cleaning, oiling, and needle changes.', NOW(), NOW()),
  (gen_random_uuid(), 'Sewing Machine Troubleshooting', 'Identifying and resolving common machine issues (tension, timing).', NOW(), NOW())

ON CONFLICT (name) DO NOTHING; -- If a skill name already exists, do not insert a duplicate

-- Optional: Verify the skills table
SELECT COUNT(*) FROM public.skills;
SELECT * FROM public.skills ORDER BY name;


------------------------------------------------------------------------------------------------------------------

ALTER TABLE public.skills
ADD COLUMN "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Optional: Add a trigger to automatically update updatedAt (if not handled by Sequelize settings)
-- This is standard practice in PostgreSQL
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.skills
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

select * from users;

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'users'
  AND column_name  = 'updatedAt';

ALTER TABLE public.users
DROP COLUMN IF EXISTS "updatedAt";


----------------------------------------------------------------------------------------------------------------------


DO $$
DECLARE
    v_supervisor_id UUID := 'd51f962a-c172-4eba-b65e-d2ba90571d21';
    v_password_hash TEXT := '$2b$10$ZYt6rNt7HJ7azlxh2fCFmeU8BVFEveLwfJmDDskLhjk3MU8.CGo0O';
    v_user_id UUID;

    v_skill_lockstitch UUID := 'f6a7b8c9-d0e1-2345-6789-0abcdef01234';
    v_skill_cutting UUID := 'a7b8c9d0-e1f2-3456-7890-bcdef0123456';
    v_skill_spreading UUID := 'a717c166-390f-4791-8beb-1028f0abd036';
    v_skill_pattern_cad UUID := 'cf7f8db5-2bb7-40ec-a243-6aa6ceb628c1';
    v_skill_pattern_manual UUID := 'ad8999ae-ffa2-4b4f-8a67-5bc0de66e446';
    v_skill_qc_stitch UUID := '481fb2a3-5b14-49f0-8065-2980847c9770';
    v_skill_qc_fabric UUID := 'a452ee68-cc50-4c81-b862-a4550cfad381';
    v_skill_pressing UUID := 'ab9996f7-6d6e-4c13-b5c8-0f2c90ac758d';
    v_skill_overlock UUID := 'f1f2a8cc-3c88-4bb1-846b-e02c45f5723c';
    v_skill_button_attach UUID := 'd9ef4aa2-9e60-4aa5-8e2e-dd2fa5216e47';
    v_skill_embroidery UUID := 'c8eb0204-2b54-486c-b864-2834d2da91c9';
    v_skill_maint_basic UUID := '8be9852e-7a82-412c-889d-ae9000b97458';
    v_skill_grading UUID := 'e81c7d03-dc36-499c-9e17-d5a4a0101869';
    v_skill_tech_pack UUID := '7ba26331-f14f-4dd9-975e-852887312c35';
BEGIN

    IF v_password_hash = '$2a$10$YourGeneratedHashForPassword123' THEN
      RAISE EXCEPTION 'Please replace the placeholder password hash in the script!';
    END IF;

    -- === Insert Users and User Skills ===

    INSERT INTO public.users (id, email, full_name, password, role, status, job_title, supervisor_id, created_at)
    VALUES (gen_random_uuid(), 'employee1@emptrack.test', 'Maya Patel', v_password_hash, 'employee', 'first_login', 'Senior Sewing Operator', v_supervisor_id, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;

    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.user_skills (user_id, skill_id, willing_to_mentor, created_at) VALUES
        (v_user_id, v_skill_lockstitch, true, NOW()),
        (v_user_id, v_skill_overlock, false, NOW()),
        (v_user_id, v_skill_button_attach, false, NOW())
      ON CONFLICT (user_id, skill_id) DO NOTHING;
    END IF;

    -- === Repeat for each user ===

    INSERT INTO public.users (id, email, full_name, password, role, status, job_title, supervisor_id, created_at)
    VALUES (gen_random_uuid(), 'employee2@emptrack.test', 'David Rodriguez', v_password_hash, 'employee', 'first_login', 'Fabric Cutter', v_supervisor_id, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;

    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.user_skills (user_id, skill_id, willing_to_mentor, created_at) VALUES
        (v_user_id, v_skill_cutting, true, NOW()),
        (v_user_id, v_skill_spreading, true, NOW())
      ON CONFLICT (user_id, skill_id) DO NOTHING;
    END IF;

    -- Aisha Khan
    INSERT INTO public.users (id, email, full_name, password, role, status, job_title, supervisor_id, created_at)
    VALUES (gen_random_uuid(), 'employee3@emptrack.test', 'Aisha Khan', v_password_hash, 'employee', 'first_login', 'Quality Inspector', v_supervisor_id, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;
    
    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.user_skills (user_id, skill_id, willing_to_mentor, created_at) VALUES
        (v_user_id, v_skill_qc_stitch, true, NOW()),
        (v_user_id, v_skill_qc_fabric, true, NOW()),
        (v_user_id, v_skill_pressing, false, NOW())
      ON CONFLICT (user_id, skill_id) DO NOTHING;
    END IF;

    -- Ben Carter
    INSERT INTO public.users (id, email, full_name, password, role, status, job_title, supervisor_id, created_at)
    VALUES (gen_random_uuid(), 'employee4@emptrack.test', 'Ben Carter', v_password_hash, 'employee', 'first_login', 'Pattern Maker', v_supervisor_id, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;
    
    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.user_skills (user_id, skill_id, willing_to_mentor, created_at) VALUES
        (v_user_id, v_skill_pattern_manual, true, NOW()),
        (v_user_id, v_skill_pattern_cad, true, NOW()),
        (v_user_id, v_skill_grading, false, NOW())
      ON CONFLICT (user_id, skill_id) DO NOTHING;
    END IF;

    -- Chloe Dubois
    INSERT INTO public.users (id, email, full_name, password, role, status, job_title, supervisor_id, created_at)
    VALUES (gen_random_uuid(), 'employee5@emptrack.test', 'Chloe Dubois', v_password_hash, 'employee', 'first_login', 'Finishing Specialist', v_supervisor_id, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;

    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.user_skills (user_id, skill_id, willing_to_mentor, created_at) VALUES
        (v_user_id, v_skill_pressing, true, NOW()),
        (v_user_id, v_skill_qc_stitch, false, NOW())
      ON CONFLICT (user_id, skill_id) DO NOTHING;
    END IF;

    -- Kenji Tanaka
    INSERT INTO public.users (id, email, full_name, password, role, status, job_title, supervisor_id, created_at)
    VALUES (gen_random_uuid(), 'employee6@emptrack.test', 'Kenji Tanaka', v_password_hash, 'employee', 'first_login', 'Embroidery Operator', v_supervisor_id, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;

    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.user_skills (user_id, skill_id, willing_to_mentor, created_at) VALUES
        (v_user_id, v_skill_embroidery, true, NOW()),
        (v_user_id, v_skill_lockstitch, false, NOW())
      ON CONFLICT (user_id, skill_id) DO NOTHING;
    END IF;

    -- Sofia Petrova
    INSERT INTO public.users (id, email, full_name, password, role, status, job_title, supervisor_id, created_at)
    VALUES (gen_random_uuid(), 'employee7@emptrack.test', 'Sofia Petrova', v_password_hash, 'employee', 'first_login', 'Sewing Technician', v_supervisor_id, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;
    
    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.user_skills (user_id, skill_id, willing_to_mentor, created_at) VALUES
        (v_user_id, v_skill_maint_basic, true, NOW()),
        (v_user_id, v_skill_lockstitch, false, NOW()),
        (v_user_id, v_skill_overlock, true, NOW())
      ON CONFLICT (user_id, skill_id) DO NOTHING;
    END IF;

    -- Liam OConnell
    INSERT INTO public.users (id, email, full_name, password, role, status, job_title, supervisor_id, created_at)
    VALUES (gen_random_uuid(), 'employee8@emptrack.test', 'Liam OConnell', v_password_hash, 'employee', 'first_login', 'Production Trainee', v_supervisor_id, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;

    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.user_skills (user_id, skill_id, willing_to_mentor, created_at) VALUES
        (v_user_id, v_skill_lockstitch, false, NOW())
      ON CONFLICT (user_id, skill_id) DO NOTHING;
    END IF;

    -- Fatima Ahmed
    INSERT INTO public.users (id, email, full_name, password, role, status, job_title, supervisor_id, created_at)
    VALUES (gen_random_uuid(), 'employee9@emptrack.test', 'Fatima Ahmed', v_password_hash, 'employee', 'first_login', 'Technical Designer', v_supervisor_id, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;

    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.user_skills (user_id, skill_id, willing_to_mentor, created_at) VALUES
        (v_user_id, v_skill_tech_pack, true, NOW()),
        (v_user_id, v_skill_pattern_cad, false, NOW())
      ON CONFLICT (user_id, skill_id) DO NOTHING;
    END IF;

    -- Noah Williams
    INSERT INTO public.users (id, email, full_name, password, role, status, job_title, supervisor_id, created_at)
    VALUES (gen_random_uuid(), 'employee10@emptrack.test', 'Noah Williams', v_password_hash, 'employee', 'first_login', 'Utility Operator', v_supervisor_id, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;

    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.user_skills (user_id, skill_id, willing_to_mentor, created_at) VALUES
        (v_user_id, v_skill_lockstitch, false, NOW()),
        (v_user_id, v_skill_overlock, false, NOW()),
        (v_user_id, v_skill_button_attach, false, NOW())
      ON CONFLICT (user_id, skill_id) DO NOTHING;
    END IF;

END $$;

-- Verify Insertions
SELECT COUNT(*) FROM public.users WHERE supervisor_id = 'd51f962a-c172-4eba-b65e-d2ba90571d21';

SELECT u.email, s.name, us.willing_to_mentor
FROM public.user_skills us
JOIN public.users u ON us.user_id = u.id
JOIN public.skills s ON us.skill_id = s.id
ORDER BY u.email, s.name;



-----------------------

-- Add timestamp columns to the users table
ALTER TABLE public.users
ADD COLUMN "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Optional but Recommended: Add the update trigger if you haven't already for this table
-- (Uses the same function created earlier if you ran it for the skills table)
CREATE TRIGGER set_timestamp_users -- Use a distinct trigger name
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


--------------------------

select * from users;


drop table requests;

----------------------------------------------------

drop type enum_requests_status;


CREATE TYPE enum_requests_type AS ENUM ('leave', 'overtime');
CREATE TYPE enum_requests_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    type enum_requests_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hours INTEGER,
    reason TEXT NOT NULL,
    status enum_requests_status NOT NULL DEFAULT 'pending',
    approver_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_requests_user_id ON public.requests(user_id);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_approver_id ON public.requests(approver_id);
