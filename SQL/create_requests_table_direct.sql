-- This script creates the requests table and adds the necessary enum types
-- Run this directly in pgAdmin or another PostgreSQL client

-- First, check if the uuid-ossp extension is installed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create request_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_type') THEN
        CREATE TYPE request_type AS ENUM ('leave', 'overtime');
        RAISE NOTICE 'Created request_type enum';
    ELSE
        RAISE NOTICE 'request_type enum already exists';
    END IF;
END $$;

-- Create request_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
        RAISE NOTICE 'Created request_status enum';
    ELSE
        RAISE NOTICE 'request_status enum already exists';
    END IF;
END $$;

-- Add 'request_submitted' to notification_type enum if it doesn't exist
DO $$ 
BEGIN
    -- Check if the enum type exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        -- Check if the value already exists in the enum
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
            AND enumlabel = 'request_submitted'
        ) THEN
            -- Add the new value to the enum
            ALTER TYPE notification_type ADD VALUE 'request_submitted';
            RAISE NOTICE 'Added ''request_submitted'' to notification_type enum';
        ELSE
            RAISE NOTICE 'Value ''request_submitted'' already exists in notification_type enum';
        END IF;
    ELSE
        RAISE NOTICE 'notification_type enum does not exist';
    END IF;
END $$;

-- Create requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type request_type NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  hours integer,
  reason text NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  approver_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comment to the table
COMMENT ON TABLE public.requests IS 'Stores leave and overtime requests from employees';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_type ON public.requests(type);

-- Check if the table was created successfully
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'requests') THEN
        RAISE NOTICE 'requests table exists';
    ELSE
        RAISE NOTICE 'requests table does not exist';
    END IF;
END $$;
