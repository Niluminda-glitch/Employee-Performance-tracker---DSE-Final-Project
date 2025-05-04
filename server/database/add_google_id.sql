-- Add google_id column to users table if it doesn't exist
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
    
    -- Also add avatar_url column if it doesn't exist
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
