--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-04-30 19:56:42

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 24643)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 927 (class 1247 OID 33065)
-- Name: enum_notifications_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_notifications_type AS ENUM (
    'system',
    'task_assigned',
    'task_completed',
    'deadline_reminder',
    'mentorship_request',
    'request_approved',
    'request_rejected',
    'announcement'
);


ALTER TYPE public.enum_notifications_type OWNER TO postgres;

--
-- TOC entry 933 (class 1247 OID 33170)
-- Name: enum_requests_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_requests_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.enum_requests_status OWNER TO postgres;

--
-- TOC entry 930 (class 1247 OID 33164)
-- Name: enum_requests_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_requests_type AS ENUM (
    'leave',
    'overtime'
);


ALTER TYPE public.enum_requests_type OWNER TO postgres;

--
-- TOC entry 918 (class 1247 OID 24834)
-- Name: enum_tasks_priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_tasks_priority AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.enum_tasks_priority OWNER TO postgres;

--
-- TOC entry 915 (class 1247 OID 24826)
-- Name: enum_tasks_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_tasks_status AS ENUM (
    'pending',
    'in-progress',
    'completed'
);


ALTER TYPE public.enum_tasks_status OWNER TO postgres;

--
-- TOC entry 924 (class 1247 OID 24881)
-- Name: enum_user_skills_proficiency_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_user_skills_proficiency_level AS ENUM (
    'beginner',
    'intermediate',
    'advanced',
    'expert'
);


ALTER TYPE public.enum_user_skills_proficiency_level OWNER TO postgres;

--
-- TOC entry 909 (class 1247 OID 24809)
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_role AS ENUM (
    'employee',
    'supervisor',
    'manager'
);


ALTER TYPE public.enum_users_role OWNER TO postgres;

--
-- TOC entry 912 (class 1247 OID 24816)
-- Name: enum_users_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_status AS ENUM (
    'active',
    'inactive',
    'first_login'
);


ALTER TYPE public.enum_users_status OWNER TO postgres;

--
-- TOC entry 885 (class 1247 OID 24636)
-- Name: mentorship_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mentorship_status AS ENUM (
    'pending',
    'accepted',
    'rejected'
);


ALTER TYPE public.mentorship_status OWNER TO postgres;

--
-- TOC entry 882 (class 1247 OID 24618)
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_type AS ENUM (
    'system',
    'task_assigned',
    'task_completed',
    'deadline_reminder',
    'mentorship_request',
    'request_approved',
    'request_rejected',
    'announcement'
);


ALTER TYPE public.notification_type OWNER TO postgres;

--
-- TOC entry 873 (class 1247 OID 24594)
-- Name: skill_proficiency; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.skill_proficiency AS ENUM (
    'learning',
    'proficient',
    'expert'
);


ALTER TYPE public.skill_proficiency OWNER TO postgres;

--
-- TOC entry 879 (class 1247 OID 24610)
-- Name: task_priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_priority AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.task_priority OWNER TO postgres;

--
-- TOC entry 876 (class 1247 OID 24602)
-- Name: task_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_status AS ENUM (
    'pending',
    'in-progress',
    'completed'
);


ALTER TYPE public.task_status OWNER TO postgres;

--
-- TOC entry 867 (class 1247 OID 24579)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'employee',
    'supervisor',
    'manager'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 870 (class 1247 OID 24586)
-- Name: user_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status AS ENUM (
    'active',
    'inactive',
    'first_login'
);


ALTER TYPE public.user_status OWNER TO postgres;

--
-- TOC entry 238 (class 1255 OID 24875)
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_set_timestamp() OWNER TO postgres;

--
-- TOC entry 237 (class 1255 OID 24804)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
      NEW.updated_at = timezone('utc', now());
   END IF;
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 24654)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 218
-- Name: TABLE departments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.departments IS 'Stores department information';


--
-- TOC entry 224 (class 1259 OID 24766)
-- Name: mentorship_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mentorship_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    requester_id uuid NOT NULL,
    mentor_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    status public.mentorship_status DEFAULT 'pending'::public.mentorship_status NOT NULL,
    message text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.mentorship_requests OWNER TO postgres;

--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE mentorship_requests; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.mentorship_requests IS 'Tracks mentorship requests between users for specific skills';


--
-- TOC entry 223 (class 1259 OID 24741)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type public.notification_type NOT NULL,
    related_task_id uuid,
    related_user_id uuid,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.notifications IS 'Stores user notifications';


--
-- TOC entry 225 (class 1259 OID 24857)
-- Name: operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    number text,
    quality_checkpoints jsonb DEFAULT '[]'::jsonb,
    smv_target numeric(5,2),
    sop_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.operations OWNER TO postgres;

--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE operations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.operations IS 'Stores details about specific work operations or tasks';


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN operations.quality_checkpoints; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.operations.quality_checkpoints IS 'JSON array of objects like [{"icon":"stitch", "text":"Check tension"}, ...]';


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN operations.smv_target; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.operations.smv_target IS 'Standard Minute Value target for the operation';


--
-- TOC entry 226 (class 1259 OID 33177)
-- Name: requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    type public.enum_requests_type NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    hours integer,
    reason text NOT NULL,
    status public.enum_requests_status DEFAULT 'pending'::public.enum_requests_status NOT NULL,
    approver_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.requests OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 24688)
-- Name: skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skills (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.skills OWNER TO postgres;

--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE skills; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.skills IS 'Stores available skills in the organization';


--
-- TOC entry 222 (class 1259 OID 24719)
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text,
    assignee_id uuid,
    supervisor_id uuid NOT NULL,
    status public.task_status DEFAULT 'pending'::public.task_status NOT NULL,
    priority public.task_priority DEFAULT 'medium'::public.task_priority NOT NULL,
    due_date date,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE tasks; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tasks IS 'Stores task information';


--
-- TOC entry 221 (class 1259 OID 24699)
-- Name: user_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_skills (
    user_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    proficiency_level public.skill_proficiency DEFAULT 'learning'::public.skill_proficiency NOT NULL,
    willing_to_mentor boolean DEFAULT false NOT NULL,
    is_certified boolean DEFAULT false NOT NULL,
    last_certified_date date,
    is_training boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.user_skills OWNER TO postgres;

--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE user_skills; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_skills IS 'Associates users with skills and their proficiency/mentorship status';


--
-- TOC entry 219 (class 1259 OID 24665)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    role public.user_role DEFAULT 'employee'::public.user_role NOT NULL,
    status public.user_status DEFAULT 'first_login'::public.user_status NOT NULL,
    department_id uuid,
    supervisor_id uuid,
    avatar_url text,
    password text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    job_title text,
    google_id text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 219
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'Stores public user profile information (and password hash for custom auth)';


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN users.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.id IS 'Should match the ID from the primary authentication system/table if separate';


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN users.password; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.password IS 'Stores the hashed password for custom authentication';


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN users.job_title; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.job_title IS 'Stores the job title of the user';


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN users.google_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.google_id IS 'Stores the unique ID from Google Sign-In';


--
-- TOC entry 5078 (class 0 OID 24654)
-- Dependencies: 218
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, name, created_at, description, updated_at) FROM stdin;
a1b2c3d4-e5f6-7890-1234-567890abcdef	Cutting	2025-04-26 07:48:23.679516+05:30	\N	2025-04-27 17:44:42.56887+05:30
b2c3d4e5-f6a7-8901-2345-67890abcdef0	Sewing Line A	2025-04-26 07:48:23.679516+05:30	\N	2025-04-27 17:44:42.56887+05:30
\.


--
-- TOC entry 5084 (class 0 OID 24766)
-- Dependencies: 224
-- Data for Name: mentorship_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mentorship_requests (id, requester_id, mentor_id, skill_id, status, message, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5083 (class 0 OID 24741)
-- Dependencies: 223
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, related_task_id, related_user_id, is_read, created_at) FROM stdin;
d341eefc-abd0-43b6-8e85-c04554f8e9f8	d51f962a-c172-4eba-b65e-d2ba90571d21	hi	hi	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:30:31.756917+05:30
27e68bad-400e-48f6-a6ee-9947eaa202e0	f6f95646-a14a-4907-90ee-cde743052cbd	hi	hi	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:30:31.756917+05:30
a76ad956-18ea-4b1f-8214-5a193f5fa0db	795f757e-ab95-4520-8c96-1d93a908cd0c	hi	hi	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:30:31.756917+05:30
4cb1925e-cfe7-4946-b8ca-1631f4477b5d	c3d4e5f6-a7b8-9012-3456-7890abcdef01	hi	hi	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:30:31.756917+05:30
8a4f29e3-5c12-4a3a-b14c-ceac5fc488ff	64298621-bf89-43f8-925c-7d3e3b38ca31	hi	hi	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:30:31.756917+05:30
5bea55d2-0658-4894-bf69-229f12d7b10b	d51f962a-c172-4eba-b65e-d2ba90571d21	ki	hiki	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:32:12.11161+05:30
d98c36da-4460-4424-8f88-536703a75c26	f6f95646-a14a-4907-90ee-cde743052cbd	ki	hiki	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:32:12.11161+05:30
a03a74d7-d4d8-42a9-89a4-a85632b32434	795f757e-ab95-4520-8c96-1d93a908cd0c	ki	hiki	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:32:12.11161+05:30
dfa5a5b0-a476-4531-9ac4-9d56f3c9c97a	c3d4e5f6-a7b8-9012-3456-7890abcdef01	ki	hiki	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:32:12.11161+05:30
1e3dc293-495f-4938-9a24-4dfb111fb2f6	64298621-bf89-43f8-925c-7d3e3b38ca31	ki	hiki	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:32:12.11161+05:30
3752ea09-8537-4c67-8473-d7727f27ab7d	d51f962a-c172-4eba-b65e-d2ba90571d21	jj	jj\n	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:56:41.999176+05:30
2ee72eac-c356-4a0f-985e-87e7e628fc44	f6f95646-a14a-4907-90ee-cde743052cbd	jj	jj\n	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:56:41.999176+05:30
985e208a-ffef-4ac5-b0ca-69813d49c636	795f757e-ab95-4520-8c96-1d93a908cd0c	jj	jj\n	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:56:41.999176+05:30
cf58876a-746c-4166-8a82-f0f13fcc4e81	c3d4e5f6-a7b8-9012-3456-7890abcdef01	jj	jj\n	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:56:41.999176+05:30
c5bd52ee-547c-4678-8202-dab167f9753f	64298621-bf89-43f8-925c-7d3e3b38ca31	jj	jj\n	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-29 21:56:41.999176+05:30
19cfb83c-e942-4a8a-b163-63504a16c73e	d51f962a-c172-4eba-b65e-d2ba90571d21	Hi World of Beginners	Hi Everyone	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-30 07:12:59.360388+05:30
f4bb4b34-ff34-42eb-b1d8-6ff3cbdc97b7	f6f95646-a14a-4907-90ee-cde743052cbd	Hi World of Beginners	Hi Everyone	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-30 07:12:59.360388+05:30
c3c44e1f-d773-4f58-92f9-2bae458c1d51	795f757e-ab95-4520-8c96-1d93a908cd0c	Hi World of Beginners	Hi Everyone	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-30 07:12:59.360388+05:30
7835baf7-5b17-4488-a662-03b1be5bccf8	a3d4e5f6-a7b8-9012-3456-7890abcdef01	Hi World of Beginners	Hi Everyone	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	t	2025-04-30 07:12:59.360388+05:30
70f6da4f-6cb5-4534-8d58-f6876ddd5d4c	c3d4e5f6-a7b8-9012-3456-7890abcdef01	Hi World of Beginners	Hi Everyone	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-30 07:12:59.360388+05:30
f6c6e861-bd16-4628-b80d-c6b1cd032eaa	64298621-bf89-43f8-925c-7d3e3b38ca31	Hi World of Beginners	Hi Everyone	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-30 07:12:59.360388+05:30
153067cf-cf87-4fef-b037-3be7da39d259	96dec196-3668-4513-8e95-ccd2eb73102a	hi	hi	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	t	2025-04-29 21:30:31.756917+05:30
abd8c074-e4ce-42f3-a978-ee7f2b2a232a	96dec196-3668-4513-8e95-ccd2eb73102a	ki	hiki	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	t	2025-04-29 21:32:12.11161+05:30
e256d6ef-40ac-4735-94cb-811ff52ff6c0	96dec196-3668-4513-8e95-ccd2eb73102a	Hi World of Beginners	Hi Everyone	announcement	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	t	2025-04-30 07:12:59.360388+05:30
a5f7d6ac-94cf-4355-a7ac-b233dfc750e2	d51f962a-c172-4eba-b65e-d2ba90571d21	New leave request	Kavishka Niluminda has submitted a new leave request	system	\N	a3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-04-30 16:29:55.418939+05:30
\.


--
-- TOC entry 5085 (class 0 OID 24857)
-- Dependencies: 225
-- Data for Name: operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operations (id, name, number, quality_checkpoints, smv_target, sop_url, created_at, updated_at) FROM stdin;
1acac501-5e82-401f-b254-e3417b598e95	Pocket Setting - Style 45A	OP-101	[{"icon": "ruler", "text": "Verify placement +/- 2mm"}, {"icon": "stitch", "text": "Ensure straight top stitch"}, {"icon": "clean", "text": "Check for oil spots"}]	1.15	https://example.com/sops/style45a-pocket.pdf	2025-04-27 06:11:38.514293+05:30	2025-04-27 06:11:38.514293+05:30
37c12d5a-3cfe-42b1-822f-f79e4b92a226	Sleeve Attachment - Style 45A	OP-105	[{"icon": "align", "text": "Match notches accurately"}, {"icon": "stitch", "text": "No puckering at curve"}, {"icon": "scissors", "text": "Trim threads inside"}]	2.50	https://example.com/sops/style45a-sleeve.mp4	2025-04-27 06:11:38.514293+05:30	2025-04-27 06:11:38.514293+05:30
101d8fcc-3e46-4b5a-8638-515f04be3603	Collar Topstitch - Style 88B	OP-210	[{"icon": "stitch", "text": "Maintain even stitch margin (3mm)"}, {"icon": "symmetry", "text": "Check point symmetry"}, {"icon": "clean", "text": "Press collar flat, no shine"}]	0.90	https://example.com/sops/style88b-collar.pdf	2025-04-27 06:11:38.514293+05:30	2025-04-27 06:11:38.514293+05:30
\.


--
-- TOC entry 5086 (class 0 OID 33177)
-- Dependencies: 226
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requests (id, user_id, type, start_date, end_date, hours, reason, status, approver_id, created_at, updated_at) FROM stdin;
120ca248-a335-4acb-8dd3-0bec63a4a4d9	a3d4e5f6-a7b8-9012-3456-7890abcdef01	leave	2025-05-01	2025-05-02	\N	I need to leave. please just let me leave	pending	\N	2025-04-30 16:29:55.162+05:30	2025-04-30 16:29:55.162+05:30
\.


--
-- TOC entry 5080 (class 0 OID 24688)
-- Dependencies: 220
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skills (id, name, description, created_at, "createdAt", "updatedAt") FROM stdin;
f6a7b8c9-d0e1-2345-6789-0abcdef01234	Lockstitch Operation	Operating standard lockstitch sewing machines.	2025-04-26 07:48:23.679516+05:30	2025-04-27 19:33:40.363765+05:30	2025-04-27 19:33:40.363765+05:30
a7b8c9d0-e1f2-3456-7890-bcdef0123456	Fabric Cutting	Operating automated or manual fabric cutting equipment.	2025-04-26 07:48:23.679516+05:30	2025-04-27 19:33:40.363765+05:30	2025-04-27 19:33:40.363765+05:30
f1f2a8cc-3c88-4bb1-846b-e02c45f5723c	Overlock/Serger Operation	Operating overlock machines for edge finishing and seaming stretch fabrics.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
be589eb7-bbd4-4d32-9f56-3763f6ae59e9	Coverstitch Operation	Operating coverstitch machines for hemming and topstitching knits.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
5abad132-6966-453d-a1ef-bb6d40fa9944	Buttonhole Machine Operation	Operating automated buttonhole machines.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
d9ef4aa2-9e60-4aa5-8e2e-dd2fa5216e47	Button Attachment Machine	Operating machines for attaching buttons.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
0783b9c5-b67d-424b-8c25-c23caf34314e	Bartack Machine Operation	Operating bartack machines for reinforcing stress points.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
fe1368f7-49ad-45bb-a0ab-b88ba72e0e8f	Flatlock Machine Operation	Operating flatlock machines for decorative or functional flat seams.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
00637244-c3de-433d-80d0-22a7ab1fc692	Blind Stitch Machine Operation	Operating blind stitch machines for invisible hemming.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
a717c166-390f-4791-8beb-1028f0abd036	Fabric Spreading	Laying out multiple plies of fabric accurately for cutting.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
7f37988b-494a-4903-ba58-30ead50e3e2a	Marker Making	Creating efficient cutting layouts (markers), manually or using CAD.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
4d590c31-8452-4308-bc3d-b301bd327b04	Plotting	Operating plotters to print markers.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
a47c48f2-e2db-4f95-9201-1a57e64f5f79	Die Cutting	Using die cutting machines for specific shapes.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
1f5182cd-d942-43bd-99de-700a7c2535e0	Fabric Inspection (Cutting)	Identifying fabric flaws before cutting.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
ad8999ae-ffa2-4b4f-8a67-5bc0de66e446	Pattern Making (Manual)	Drafting patterns using traditional tools.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
cf7f8db5-2bb7-40ec-a243-6aa6ceb628c1	Pattern Making (CAD)	Using CAD software (e.g., Lectra, Gerber, Optitex) for pattern creation.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
e81c7d03-dc36-499c-9e17-d5a4a0101869	Pattern Grading	Scaling base patterns to different sizes.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
230ff186-0ea8-4fc8-91dd-e6bdbd24da3e	Draping	Creating patterns by draping fabric on a dress form.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
d6514cf4-c0a0-4a06-88a7-455af2954b55	Technical Sketching	Creating detailed flat sketches for production.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
7ba26331-f14f-4dd9-975e-852887312c35	Tech Pack Creation	Developing comprehensive technical packages for manufacturing.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
ab9996f7-6d6e-4c13-b5c8-0f2c90ac758d	Garment Pressing/Ironing	Using industrial irons and presses for finishing.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
27bbefed-d3f1-479b-ab27-3d44b4cc4799	Steam Tunnel Operation	Using steam tunnels for wrinkle removal.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
7201c21c-6e7d-4b20-a12e-e8d52502bb45	Folding & Bagging	Preparing finished garments for shipping.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
363e01a3-d120-448b-ade8-6c3e42a6bd13	Label & Tag Attachment	Attaching brand labels, care labels, and hang tags.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
35a8290f-df50-48e9-944e-a8dd7907006e	Spot Cleaning	Removing stains or marks from finished garments.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
a45c2025-85e8-4302-99ed-db264ef4b10b	Trimming Threads	Cleaning loose threads from garments.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
481fb2a3-5b14-49f0-8065-2980847c9770	Stitch Quality Inspection	Evaluating seam quality, tension, and consistency.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
913f9f2e-7e75-4282-9ebf-900d2a983584	Measurement Checking	Verifying garment dimensions against specifications.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
a452ee68-cc50-4c81-b862-a4550cfad381	Fabric Quality Control	Identifying fabric defects like holes, stains, or inconsistencies.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
a0bc8065-6563-4d32-a125-fe10bfe2b1c5	Inline Quality Checking (Sewing)	Inspecting garments during the sewing process.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
03d0b128-085e-42b7-a21d-671bb0f53832	Final Quality Inspection (AQL)	Performing Acceptable Quality Limit inspections on finished goods.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
46d709bd-1bf9-48f8-8a03-785125cda45d	Color Matching	Assessing color consistency across garments and batches.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
c8eb0204-2b54-486c-b864-2834d2da91c9	Embroidery Machine Operation	Operating single or multi-head embroidery machines.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
4e716d06-15f0-4acf-9b6e-eaf826ab2078	Screen Printing	Applying designs using screen printing techniques.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
86c436e1-2c3d-4fdc-8a83-be4842d7847b	Heat Transfer Application	Applying heat transfers or vinyl graphics.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
98d20cfd-89bb-4990-8c1c-eec552227ebb	Garment Dyeing	Operating garment dyeing equipment.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
e90527dc-21f2-4de2-b3da-86bb111ff67a	Laser Cutting/Engraving (Textiles)	Using laser machines for cutting or etching fabric.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
865fe247-18f7-4e5c-ac55-a5b0d451b24a	Pleating	Creating pleats using specialized equipment or manually.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
6e0c43a5-ee2c-4db3-abd9-295433e6ede8	Seam Sealing	Applying waterproof tape to seams.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
e182a26e-3ea4-4459-a413-82e12b422bae	Knit Fabric Handling	Specific techniques for working with stretchy knit fabrics.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
6c6f925b-41b0-4dc8-875f-99d4839533be	Woven Fabric Handling	Specific techniques for working with stable woven fabrics.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
b1ba9386-af81-440c-b262-bb69a237bb8d	Leather/Suede Handling	Techniques for sewing and handling leather materials.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
a84e96af-c8bf-4af6-b2ff-3947a77e4fbc	Denim Processing	Knowledge of washing, finishing, and sewing denim.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
8be9852e-7a82-412c-889d-ae9000b97458	Sewing Machine Basic Maintenance	Performing routine cleaning, oiling, and needle changes.	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
897f7c75-c098-4f2b-bdde-bc22a359da55	Sewing Machine Troubleshooting	Identifying and resolving common machine issues (tension, timing).	2025-04-27 14:03:55.136874+05:30	2025-04-27 19:33:55.136874+05:30	2025-04-27 19:33:55.136874+05:30
\.


--
-- TOC entry 5082 (class 0 OID 24719)
-- Dependencies: 222
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, assignee_id, supervisor_id, status, priority, due_date, created_at, updated_at) FROM stdin;
c16f5fb8-2a8c-4e2a-8cd9-fc11a77ac3d9	Prepare Cut Fabric for Style ABC	Bundle 50 units of main body pieces.	64298621-bf89-43f8-925c-7d3e3b38ca31	d51f962a-c172-4eba-b65e-d2ba90571d21	pending	high	2025-05-10	2025-04-26 17:55:11.083767+05:30	2025-04-26 17:55:11.083767+05:30
08ca3f22-746f-493d-ac2c-6bc44655fdf4	Inspect Stitching Quality - Line A	Perform hourly checks on 10 random garments.	f6f95646-a14a-4907-90ee-cde743052cbd	d51f962a-c172-4eba-b65e-d2ba90571d21	in-progress	medium	\N	2025-04-26 17:55:11.083767+05:30	2025-04-26 17:55:11.083767+05:30
93151c89-98b2-404d-8d74-c65e43c35dbb	Review Production Schedule	Update the production schedule for next week.	795f757e-ab95-4520-8c96-1d93a908cd0c	d51f962a-c172-4eba-b65e-d2ba90571d21	pending	low	2025-05-15	2025-04-26 17:55:11.083767+05:30	2025-04-26 17:55:11.083767+05:30
f7e18b3b-7829-455c-a560-5b5e06d30d75	Quality Check - Finished Products	Perform final quality check on finished products.	64298621-bf89-43f8-925c-7d3e3b38ca31	d51f962a-c172-4eba-b65e-d2ba90571d21	completed	high	2025-05-05	2025-04-26 17:55:11.083767+05:30	2025-04-26 17:55:11.083767+05:30
7c90840d-fd6d-47b0-8d6b-d2c6276386cb	K9 Product review	K9 Product review. Effectivly	795f757e-ab95-4520-8c96-1d93a908cd0c	d51f962a-c172-4eba-b65e-d2ba90571d21	in-progress	high	2025-04-30	2025-04-27 09:39:49.497+05:30	2025-04-27 10:09:14.196893+05:30
e55eac18-0730-4898-ae84-e539047dd1f2	ButtonSet	Button	f2f13beb-0953-4080-a59e-c2948fa2ba78	d51f962a-c172-4eba-b65e-d2ba90571d21	pending	high	2025-05-01	2025-04-28 10:53:13.219+05:30	2025-04-28 10:53:13.219+05:30
31770bac-0911-4b61-b1f4-3309d83f2bc6	Source adding	scdfwesa	a3d4e5f6-a7b8-9012-3456-7890abcdef01	d51f962a-c172-4eba-b65e-d2ba90571d21	completed	high	2025-04-30	2025-04-27 23:00:20.976+05:30	2025-04-30 16:36:55.826401+05:30
8fdf55ad-d3c1-4b04-b1f7-77dc4ff5d476	Prepare Monthly Sales Report	Compile and summarize the sales data for April.	a3d4e5f6-a7b8-9012-3456-7890abcdef01	d51f962a-c172-4eba-b65e-d2ba90571d21	completed	medium	2025-05-05	2025-04-27 01:08:00.476068+05:30	2025-04-30 16:36:57.563866+05:30
dfed9ae6-9276-4e08-8cc4-655d79210b7e	Get Approval for the new E1 project	Get Approval for the new E1 project. Before 7th May	a3d4e5f6-a7b8-9012-3456-7890abcdef01	d51f962a-c172-4eba-b65e-d2ba90571d21	completed	high	2025-05-07	2025-04-27 08:10:46.744+05:30	2025-04-30 16:36:59.366805+05:30
b28fa36c-e09f-4c2e-aa8c-fa6c4151b5db	Organize Team Meeting	Set up a meeting to discuss Q2 goals and plans.	a3d4e5f6-a7b8-9012-3456-7890abcdef01	d51f962a-c172-4eba-b65e-d2ba90571d21	completed	low	2025-05-08	2025-04-27 01:08:00.476068+05:30	2025-04-30 16:37:03.599065+05:30
9db4050a-9b12-429c-93cc-055b186d6f87	Update Employee Records	Ensure all employee information is current in the HR system.	a3d4e5f6-a7b8-9012-3456-7890abcdef01	d51f962a-c172-4eba-b65e-d2ba90571d21	completed	high	2025-05-12	2025-04-27 01:08:00.476068+05:30	2025-04-30 16:37:13.618453+05:30
\.


--
-- TOC entry 5081 (class 0 OID 24699)
-- Dependencies: 221
-- Data for Name: user_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_skills (user_id, skill_id, proficiency_level, willing_to_mentor, is_certified, last_certified_date, is_training, created_at) FROM stdin;
c3d4e5f6-a7b8-9012-3456-7890abcdef01	f6a7b8c9-d0e1-2345-6789-0abcdef01234	proficient	t	f	\N	f	2025-04-26 07:48:23.679516+05:30
870a3459-5d29-4f19-8548-e2545ad35bd9	ad8999ae-ffa2-4b4f-8a67-5bc0de66e446	learning	t	f	\N	f	2025-04-27 20:41:17.128769+05:30
870a3459-5d29-4f19-8548-e2545ad35bd9	cf7f8db5-2bb7-40ec-a243-6aa6ceb628c1	learning	t	f	\N	f	2025-04-27 20:41:17.128769+05:30
870a3459-5d29-4f19-8548-e2545ad35bd9	e81c7d03-dc36-499c-9e17-d5a4a0101869	learning	f	f	\N	f	2025-04-27 20:41:17.128769+05:30
f8e5bdd1-abd2-4457-b423-4631cda78fc1	ab9996f7-6d6e-4c13-b5c8-0f2c90ac758d	learning	t	f	\N	f	2025-04-27 20:41:17.128769+05:30
f8e5bdd1-abd2-4457-b423-4631cda78fc1	481fb2a3-5b14-49f0-8065-2980847c9770	learning	f	f	\N	f	2025-04-27 20:41:17.128769+05:30
68d5f92c-d0e3-40db-b8af-a07f6e96ab82	c8eb0204-2b54-486c-b864-2834d2da91c9	learning	t	f	\N	f	2025-04-27 20:41:17.128769+05:30
68d5f92c-d0e3-40db-b8af-a07f6e96ab82	f6a7b8c9-d0e1-2345-6789-0abcdef01234	learning	f	f	\N	f	2025-04-27 20:41:17.128769+05:30
12014d30-267a-415b-8f41-3c1a891ebca7	8be9852e-7a82-412c-889d-ae9000b97458	learning	t	f	\N	f	2025-04-27 20:41:17.128769+05:30
12014d30-267a-415b-8f41-3c1a891ebca7	f6a7b8c9-d0e1-2345-6789-0abcdef01234	learning	f	f	\N	f	2025-04-27 20:41:17.128769+05:30
12014d30-267a-415b-8f41-3c1a891ebca7	f1f2a8cc-3c88-4bb1-846b-e02c45f5723c	learning	t	f	\N	f	2025-04-27 20:41:17.128769+05:30
7e1f740f-6dab-47a6-a1ef-45c8c08d8713	f6a7b8c9-d0e1-2345-6789-0abcdef01234	learning	f	f	\N	f	2025-04-27 20:41:17.128769+05:30
b3d951a7-85b9-4541-8f24-baa861a77f7f	7ba26331-f14f-4dd9-975e-852887312c35	learning	t	f	\N	f	2025-04-27 20:41:17.128769+05:30
b3d951a7-85b9-4541-8f24-baa861a77f7f	cf7f8db5-2bb7-40ec-a243-6aa6ceb628c1	learning	f	f	\N	f	2025-04-27 20:41:17.128769+05:30
04c54fa5-6a16-452a-86d6-e5533601a095	f6a7b8c9-d0e1-2345-6789-0abcdef01234	learning	f	f	\N	f	2025-04-27 20:41:17.128769+05:30
04c54fa5-6a16-452a-86d6-e5533601a095	f1f2a8cc-3c88-4bb1-846b-e02c45f5723c	learning	f	f	\N	f	2025-04-27 20:41:17.128769+05:30
04c54fa5-6a16-452a-86d6-e5533601a095	d9ef4aa2-9e60-4aa5-8e2e-dd2fa5216e47	learning	f	f	\N	f	2025-04-27 20:41:17.128769+05:30
\.


--
-- TOC entry 5079 (class 0 OID 24665)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, full_name, role, status, department_id, supervisor_id, avatar_url, password, created_at, updated_at, job_title, google_id, "createdAt") FROM stdin;
68d5f92c-d0e3-40db-b8af-a07f6e96ab82	employee6@emptrack.test	Kenji Tanaka	employee	first_login	\N	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2b$10$ZYt6rNt7HJ7azlxh2fCFmeU8BVFEveLwfJmDDskLhjk3MU8.CGo0O	2025-04-27 20:41:17.128769+05:30	2025-04-27 15:11:17.128769+05:30	Embroidery Operator	\N	2025-04-27 20:41:17.128769+05:30
d51f962a-c172-4eba-b65e-d2ba90571d21	supervisor@emptrack.test	Test Supervisor	supervisor	active	\N	\N	\N	$2a$10$4eB94jNjgVvTN3tm2MpnDuZUoekuMUoUXxAwmbMTYRv5xzHLEf..W	2025-04-26 21:22:39.631724+05:30	2025-04-26 21:22:39.631724+05:30	Line Supervisor	\N	2025-04-27 20:06:32.618964+05:30
f6f95646-a14a-4907-90ee-cde743052cbd	employee2@emptrack.test	Bob Worker	employee	active	\N	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2a$10$Ht.TUza.rVWBjLRZ5Gg9/.IfbROXQCzZ.PFqYHBLwOIuXKfGcKcXa	2025-04-26 21:44:04.470725+05:30	2025-04-26 21:44:04.470725+05:30	Cutter Assistant	\N	2025-04-27 20:06:32.618964+05:30
795f757e-ab95-4520-8c96-1d93a908cd0c	employee3@emptrack.test	Eva Quality	employee	active	\N	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2a$10$Ht.TUza.rVWBjLRZ5Gg9/.IfbROXQCzZ.PFqYHBLwOIuXKfGcKcXa	2025-04-26 21:44:04.470725+05:30	2025-04-26 21:44:04.470725+05:30	QA Assistant	\N	2025-04-27 20:06:32.618964+05:30
a3d4e5f6-a7b8-9012-3456-7890abcdef01	kavishka@emptrack.test	Kavishka Niluminda	employee	active	b2c3d4e5-f6a7-8901-2345-67890abcdef0	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2a$10$8ikir04Qlsu8NQDuGV7dDesVXDObh1L5FXcuh8pn38ftQJQj5njO6	2025-04-26 12:26:37.403876+05:30	2025-04-27 02:38:55.006607+05:30	\N	\N	2025-04-27 20:06:32.618964+05:30
12014d30-267a-415b-8f41-3c1a891ebca7	employee7@emptrack.test	Sofia Petrova	employee	first_login	\N	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2b$10$ZYt6rNt7HJ7azlxh2fCFmeU8BVFEveLwfJmDDskLhjk3MU8.CGo0O	2025-04-27 20:41:17.128769+05:30	2025-04-27 15:11:17.128769+05:30	Sewing Technician	\N	2025-04-27 20:41:17.128769+05:30
7e1f740f-6dab-47a6-a1ef-45c8c08d8713	employee8@emptrack.test	Liam OConnell	employee	first_login	\N	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2b$10$ZYt6rNt7HJ7azlxh2fCFmeU8BVFEveLwfJmDDskLhjk3MU8.CGo0O	2025-04-27 20:41:17.128769+05:30	2025-04-27 15:11:17.128769+05:30	Production Trainee	\N	2025-04-27 20:41:17.128769+05:30
b3d951a7-85b9-4541-8f24-baa861a77f7f	employee9@emptrack.test	Fatima Ahmed	employee	first_login	\N	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2b$10$ZYt6rNt7HJ7azlxh2fCFmeU8BVFEveLwfJmDDskLhjk3MU8.CGo0O	2025-04-27 20:41:17.128769+05:30	2025-04-27 15:11:17.128769+05:30	Technical Designer	\N	2025-04-27 20:41:17.128769+05:30
04c54fa5-6a16-452a-86d6-e5533601a095	employee10@emptrack.test	Noah Williams	employee	first_login	\N	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2b$10$ZYt6rNt7HJ7azlxh2fCFmeU8BVFEveLwfJmDDskLhjk3MU8.CGo0O	2025-04-27 20:41:17.128769+05:30	2025-04-27 15:11:17.128769+05:30	Utility Operator	\N	2025-04-27 20:41:17.128769+05:30
f2f13beb-0953-4080-a59e-c2948fa2ba78	nirasha@emptrack.test	Nethmi Nirasha	employee	first_login	a1b2c3d4-e5f6-7890-1234-567890abcdef	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2a$10$7x7BserAAKNRaJdK9wbtMe3ffeVT0c5Wp2sXZhoalumEox6p8UtIq	2025-04-27 23:04:23.572+05:30	2025-04-27 23:04:23.572+05:30	Line supervisor	\N	2025-04-27 23:04:23.671887+05:30
c3d4e5f6-a7b8-9012-3456-7890abcdef01	alice@emptrack.test	Alice Employee	employee	active	b2c3d4e5-f6a7-8901-2345-67890abcdef0	\N	\N	$2b$10$V1u6lV6Xefh7QjNd1VFE0eA9uH.vD/rC9nMBwv0g7bGgbN1NcGuIS	2025-04-26 07:48:23.679516+05:30	2025-04-27 10:30:14.999371+05:30		\N	2025-04-27 20:06:32.618964+05:30
8aeb13ab-4e47-4571-a1d6-3c7fdbe17639	sadinsa@gmail.com	Sadinsa Wrangani	employee	first_login	a1b2c3d4-e5f6-7890-1234-567890abcdef	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2a$10$FEs86M.gVGYwqmOfXWqq4O4SjVHzJHhcf/WeYpthb1ep1/D.Kk.O6	2025-04-28 10:56:52.066+05:30	2025-04-28 10:56:52.066+05:30	Line Supervisor	\N	2025-04-28 10:56:52.22063+05:30
64298621-bf89-43f8-925c-7d3e3b38ca31	employee1@emptrack.test	Alice Employee	employee	active	\N	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2a$10$Ht.TUza.rVWBjLRZ5Gg9/.IfbROXQCzZ.PFqYHBLwOIuXKfGcKcXa	2025-04-26 21:44:04.470725+05:30	2025-04-27 10:33:17.639301+05:30	Stitcher	\N	2025-04-27 20:06:32.618964+05:30
96dec196-3668-4513-8e95-ccd2eb73102a	manager@emptrack.test	Test Manager	manager	active	\N	\N	\N	$2a$10$sNWFH.btj6zwiHY4SA18oeYXl4ZX4HzlhusiFsJZ.O08VqVttZ/Qm	2025-04-26 21:22:39.631724+05:30	2025-04-27 10:34:04.360349+05:30	Factory Manager	\N	2025-04-27 20:06:32.618964+05:30
ef80f3ec-a56b-4a65-9d4d-b7cf8095f9b8	kamal@emptrack.test	Kamal Dassanayake	employee	first_login	\N	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2a$10$l5p1C1IJRd0.Z8HtjO6eB.8FQv6mykCM3kAzudAz3svEQvoCrEWhG	2025-04-27 16:47:45.738+05:30	2025-04-27 16:47:45.738+05:30	Stitcher	\N	2025-04-27 20:06:32.618964+05:30
870a3459-5d29-4f19-8548-e2545ad35bd9	employee4@emptrack.test	Ben Carter	employee	first_login	\N	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2b$10$ZYt6rNt7HJ7azlxh2fCFmeU8BVFEveLwfJmDDskLhjk3MU8.CGo0O	2025-04-27 20:41:17.128769+05:30	2025-04-27 15:11:17.128769+05:30	Pattern Maker	\N	2025-04-27 20:41:17.128769+05:30
f8e5bdd1-abd2-4457-b423-4631cda78fc1	employee5@emptrack.test	Chloe Dubois	employee	first_login	\N	d51f962a-c172-4eba-b65e-d2ba90571d21	\N	$2b$10$ZYt6rNt7HJ7azlxh2fCFmeU8BVFEveLwfJmDDskLhjk3MU8.CGo0O	2025-04-27 20:41:17.128769+05:30	2025-04-27 15:11:17.128769+05:30	Finishing Specialist	\N	2025-04-27 20:41:17.128769+05:30
\.


--
-- TOC entry 4869 (class 2606 OID 24664)
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- TOC entry 4871 (class 2606 OID 24662)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 24776)
-- Name: mentorship_requests mentorship_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentorship_requests
    ADD CONSTRAINT mentorship_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4897 (class 2606 OID 24750)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4905 (class 2606 OID 24869)
-- Name: operations operations_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT operations_number_key UNIQUE (number);


--
-- TOC entry 4907 (class 2606 OID 24867)
-- Name: operations operations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operations
    ADD CONSTRAINT operations_pkey PRIMARY KEY (id);


--
-- TOC entry 4912 (class 2606 OID 33187)
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4883 (class 2606 OID 24698)
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);


--
-- TOC entry 4885 (class 2606 OID 24696)
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- TOC entry 4894 (class 2606 OID 24730)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4887 (class 2606 OID 24708)
-- Name: user_skills user_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_pkey PRIMARY KEY (user_id, skill_id);


--
-- TOC entry 4877 (class 2606 OID 24677)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4879 (class 2606 OID 24824)
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- TOC entry 4881 (class 2606 OID 24675)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4898 (class 1259 OID 24802)
-- Name: idx_mentorship_requests_mentor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mentorship_requests_mentor_id ON public.mentorship_requests USING btree (mentor_id);


--
-- TOC entry 4899 (class 1259 OID 24801)
-- Name: idx_mentorship_requests_requester_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mentorship_requests_requester_id ON public.mentorship_requests USING btree (requester_id);


--
-- TOC entry 4900 (class 1259 OID 24803)
-- Name: idx_mentorship_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mentorship_requests_status ON public.mentorship_requests USING btree (status);


--
-- TOC entry 4895 (class 1259 OID 24800)
-- Name: idx_notifications_user_id_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id_read ON public.notifications USING btree (user_id, is_read);


--
-- TOC entry 4903 (class 1259 OID 24871)
-- Name: idx_operations_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_operations_number ON public.operations USING btree (number);


--
-- TOC entry 4908 (class 1259 OID 33200)
-- Name: idx_requests_approver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_approver_id ON public.requests USING btree (approver_id);


--
-- TOC entry 4909 (class 1259 OID 33199)
-- Name: idx_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_status ON public.requests USING btree (status);


--
-- TOC entry 4910 (class 1259 OID 33198)
-- Name: idx_requests_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_user_id ON public.requests USING btree (user_id);


--
-- TOC entry 4889 (class 1259 OID 24796)
-- Name: idx_tasks_assignee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_assignee_id ON public.tasks USING btree (assignee_id);


--
-- TOC entry 4890 (class 1259 OID 24799)
-- Name: idx_tasks_due_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_due_date ON public.tasks USING btree (due_date);


--
-- TOC entry 4891 (class 1259 OID 24798)
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


--
-- TOC entry 4892 (class 1259 OID 24797)
-- Name: idx_tasks_supervisor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_supervisor_id ON public.tasks USING btree (supervisor_id);


--
-- TOC entry 4872 (class 1259 OID 24793)
-- Name: idx_users_department_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_department_id ON public.users USING btree (department_id);


--
-- TOC entry 4873 (class 1259 OID 24795)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4874 (class 1259 OID 24792)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 4875 (class 1259 OID 24794)
-- Name: idx_users_supervisor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_supervisor_id ON public.users USING btree (supervisor_id);


--
-- TOC entry 4888 (class 1259 OID 24889)
-- Name: user_skills_user_id_skill_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_skills_user_id_skill_id ON public.user_skills USING btree (user_id, skill_id);


--
-- TOC entry 4931 (class 2620 OID 24807)
-- Name: mentorship_requests handle_mentorship_requests_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_mentorship_requests_updated_at BEFORE UPDATE ON public.mentorship_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4932 (class 2620 OID 24870)
-- Name: operations handle_operations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_operations_updated_at BEFORE UPDATE ON public.operations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4930 (class 2620 OID 24806)
-- Name: tasks handle_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4927 (class 2620 OID 24805)
-- Name: users handle_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4929 (class 2620 OID 24876)
-- Name: skills set_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- TOC entry 4928 (class 2620 OID 24879)
-- Name: users set_timestamp_users; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- TOC entry 4922 (class 2606 OID 24782)
-- Name: mentorship_requests mentorship_requests_mentor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentorship_requests
    ADD CONSTRAINT mentorship_requests_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4923 (class 2606 OID 24777)
-- Name: mentorship_requests mentorship_requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentorship_requests
    ADD CONSTRAINT mentorship_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4924 (class 2606 OID 24787)
-- Name: mentorship_requests mentorship_requests_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentorship_requests
    ADD CONSTRAINT mentorship_requests_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- TOC entry 4919 (class 2606 OID 24756)
-- Name: notifications notifications_related_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_related_task_id_fkey FOREIGN KEY (related_task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;


--
-- TOC entry 4920 (class 2606 OID 24761)
-- Name: notifications notifications_related_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_related_user_id_fkey FOREIGN KEY (related_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4921 (class 2606 OID 24751)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4925 (class 2606 OID 33193)
-- Name: requests requests_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(id);


--
-- TOC entry 4926 (class 2606 OID 33188)
-- Name: requests requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4917 (class 2606 OID 24731)
-- Name: tasks tasks_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4918 (class 2606 OID 24736)
-- Name: tasks tasks_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4915 (class 2606 OID 24714)
-- Name: user_skills user_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- TOC entry 4916 (class 2606 OID 24709)
-- Name: user_skills user_skills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4913 (class 2606 OID 24678)
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- TOC entry 4914 (class 2606 OID 24683)
-- Name: users users_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


-- Completed on 2025-04-30 19:56:42

--
-- PostgreSQL database dump complete
--

