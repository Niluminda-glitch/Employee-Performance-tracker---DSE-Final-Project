-- Add job_title column to users table if it doesn't exist
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
