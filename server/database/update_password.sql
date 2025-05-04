-- Update the password for kavishka@emptrack.test
UPDATE public.users 
SET password = '$2a$10$xfhPikVm70gDTRlwaPAvGeBsSCqWcfkID56Fn1W7IRCawk0xM3PqG' 
WHERE email = 'kavishka@emptrack.test';
