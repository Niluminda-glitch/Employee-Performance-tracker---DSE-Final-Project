
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table with extended profile data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('employee', 'supervisor', 'manager')) DEFAULT 'employee',
  first_name TEXT,
  last_name TEXT,
  job_title TEXT,
  department TEXT,
  supervisor_id UUID REFERENCES auth.users(id),
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Grant access to users table for authenticated users
CREATE POLICY "Users can view their own user data" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own user data" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow managers to view all user data
CREATE POLICY "Managers can view all user data" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'manager'
  );

-- Allow supervisors to view their team members' data
CREATE POLICY "Supervisors can view their team's data" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    ((SELECT role FROM public.users WHERE id = auth.uid()) = 'supervisor') AND
    (supervisor_id = auth.uid())
  );

-- Create a skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a user_skills junction table
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  skill_id UUID REFERENCES public.skills(id) NOT NULL,
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('not_skilled', 'learning', 'proficient', 'expert')),
  is_certified BOOLEAN DEFAULT FALSE,
  is_training BOOLEAN DEFAULT FALSE,
  last_certified_date TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, skill_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on skills tables
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- Skills policies
CREATE POLICY "Everyone can view skills" ON public.skills
  FOR SELECT
  TO authenticated
  USING (true);

-- User skills policies
CREATE POLICY "Users can view their own skills" ON public.user_skills
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills" ON public.user_skills
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all user skills" ON public.user_skills
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'manager'
  );

CREATE POLICY "Supervisors can view their team's skills" ON public.user_skills
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = user_id
        AND users.supervisor_id = auth.uid()
        AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'supervisor'
    )
  );

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  creator_id UUID REFERENCES public.users(id) NOT NULL,
  assignee_id UUID REFERENCES public.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Task policies
CREATE POLICY "Users can view tasks assigned to them" ON public.tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = assignee_id OR auth.uid() = creator_id);

CREATE POLICY "Users can update tasks assigned to them" ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = assignee_id);

CREATE POLICY "Supervisors can view and create tasks for their team" ON public.tasks
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('supervisor', 'manager')
  );

-- Create departments table for organizational structure
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on departments table
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view departments
CREATE POLICY "Everyone can view departments" ON public.departments
  FOR SELECT
  TO authenticated
  USING (true);

-- Only managers can modify departments
CREATE POLICY "Only managers can modify departments" ON public.departments
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'manager'
  );

-- Create a function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_skills_timestamp
BEFORE UPDATE ON public.skills
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_skills_timestamp
BEFORE UPDATE ON public.user_skills
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tasks_timestamp
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_departments_timestamp
BEFORE UPDATE ON public.departments
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
