-- Update the trigger_set_timestamp function to use updated_at instead of updatedAt
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Notify about the change
DO $$
BEGIN
  RAISE NOTICE 'The trigger_set_timestamp function has been updated to use updated_at instead of updatedAt';
END $$;
