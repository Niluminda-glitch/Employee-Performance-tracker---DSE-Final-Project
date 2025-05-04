-- Add department_id column to users table if it doesn't exist
DO $$
BEGIN
    -- First, check if the departments table exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'departments'
    ) THEN
        -- Create departments table if it doesn't exist
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
    
    -- Now check if the department_id column exists in users table
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
