-- Add department column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'department'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN department TEXT NULL;
        
        COMMENT ON COLUMN public.users.department IS 'Stores the department of the user';
        
        RAISE NOTICE 'Added department column to users table';
    ELSE
        RAISE NOTICE 'department column already exists in users table';
    END IF;
END $$;
