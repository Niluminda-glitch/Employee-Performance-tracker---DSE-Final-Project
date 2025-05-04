-- Comprehensive script to update all columns in the users table

-- First, create the departments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'departments'
    ) THEN
        -- Create departments table
        CREATE TABLE public.departments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Created departments table';
        
        -- Add a sample department
        INSERT INTO public.departments (name, description)
        VALUES ('General', 'General department for all employees');
        
        RAISE NOTICE 'Added sample department';
    END IF;
END $$;

-- Add job_title column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'job_title'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN job_title TEXT NULL;
        
        COMMENT ON COLUMN public.users.job_title IS 'Stores the job title of the user';
        
        RAISE NOTICE 'Added job_title column to users table';
    ELSE
        RAISE NOTICE 'job_title column already exists in users table';
    END IF;
END $$;

-- Add department_id column
DO $$
BEGIN
    -- Check if the department_id column exists in users table
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'department_id'
    ) THEN
        -- Add department_id column
        ALTER TABLE public.users
        ADD COLUMN department_id UUID NULL REFERENCES public.departments(id) ON DELETE SET NULL ON UPDATE CASCADE;
        
        COMMENT ON COLUMN public.users.department_id IS 'Foreign key reference to departments table';
        
        RAISE NOTICE 'Added department_id column to users table';
    ELSE
        RAISE NOTICE 'department_id column already exists in users table';
    END IF;
    
    -- Check if the department column exists (the old one we want to replace)
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'department'
    ) THEN
        -- Drop the old department column
        ALTER TABLE public.users
        DROP COLUMN department;
        
        RAISE NOTICE 'Dropped old department column from users table';
    END IF;
END $$;

-- Add google_id column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'google_id'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN google_id TEXT NULL UNIQUE;
        
        COMMENT ON COLUMN public.users.google_id IS 'Stores the unique ID from Google Sign-In';
        
        RAISE NOTICE 'Added google_id column to users table';
    ELSE
        RAISE NOTICE 'google_id column already exists in users table';
    END IF;
END $$;

-- Add avatar_url column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN avatar_url TEXT NULL;
        
        COMMENT ON COLUMN public.users.avatar_url IS 'Stores the URL to the user avatar image';
        
        RAISE NOTICE 'Added avatar_url column to users table';
    ELSE
        RAISE NOTICE 'avatar_url column already exists in users table';
    END IF;
END $$;
