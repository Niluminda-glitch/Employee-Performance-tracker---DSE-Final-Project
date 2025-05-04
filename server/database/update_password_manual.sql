-- SQL script to update password for kavishka@emptrack.test
UPDATE public.users
SET password = '$2a$10$8ikir04Qlsu8NQDuGV7dDesVXDObh1L5FXcuh8pn38ftQJQj5njO6'
WHERE email = 'kavishka@emptrack.test';
