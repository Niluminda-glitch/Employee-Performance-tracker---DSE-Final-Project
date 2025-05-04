-- Check for triggers on the users table
SELECT 
    tgname AS trigger_name,
    tgrelid::regclass AS table_name,
    tgfoid::regproc AS function_name,
    tgenabled AS enabled
FROM pg_trigger
WHERE tgrelid = 'public.users'::regclass;

-- List all triggers in the database
SELECT 
    tgname AS trigger_name,
    tgrelid::regclass AS table_name,
    tgfoid::regproc AS function_name,
    tgenabled AS enabled
FROM pg_trigger
WHERE tgfoid::regproc::text LIKE '%timestamp%';
