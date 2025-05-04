-- Create the tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    supervisor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert sample tasks (Replace UUIDs with actual UUIDs from your database)
-- First, get the UUIDs of your users
-- SELECT id, email, full_name, role FROM public.users;

-- Insert sample tasks
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
