--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4 (Debian 15.4-2.pgdg120+1)
-- Dumped by pg_dump version 15.3 (Debian 15.3-0+deb12u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: PrismaChanMode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PrismaChanMode" AS ENUM (
    'PUBLIC',
    'PRIVATE',
    'PROTECTED',
    'DM'
);


ALTER TYPE public."PrismaChanMode" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: FriendRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FriendRequest" (
    id integer NOT NULL,
    "fromId" integer NOT NULL,
    "toId" integer NOT NULL
);


ALTER TABLE public."FriendRequest" OWNER TO postgres;

--
-- Name: FriendRequest_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."FriendRequest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."FriendRequest_id_seq" OWNER TO postgres;

--
-- Name: FriendRequest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."FriendRequest_id_seq" OWNED BY public."FriendRequest".id;


--
-- Name: _admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._admins (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public._admins OWNER TO postgres;

--
-- Name: _banned; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._banned (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public._banned OWNER TO postgres;

--
-- Name: _friendship; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._friendship (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public._friendship OWNER TO postgres;

--
-- Name: _joined; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._joined (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public._joined OWNER TO postgres;

--
-- Name: _kicked; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._kicked (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public._kicked OWNER TO postgres;

--
-- Name: _muted; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._muted (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public._muted OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.channels (
    id integer NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mode public."PrismaChanMode" DEFAULT 'PUBLIC'::public."PrismaChanMode" NOT NULL,
    password text,
    name text NOT NULL,
    "ownerId" integer NOT NULL
);


ALTER TABLE public.channels OWNER TO postgres;

--
-- Name: channels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.channels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.channels_id_seq OWNER TO postgres;

--
-- Name: channels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.channels_id_seq OWNED BY public.channels.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fromId" integer NOT NULL,
    "to" text NOT NULL,
    content text NOT NULL,
    "channelId" integer NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    nickname text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    avatar text,
    bio text,
    "authenticationSecret" text,
    "authenticationEnabled" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: FriendRequest id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FriendRequest" ALTER COLUMN id SET DEFAULT nextval('public."FriendRequest_id_seq"'::regclass);


--
-- Name: channels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channels ALTER COLUMN id SET DEFAULT nextval('public.channels_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: FriendRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FriendRequest" (id, "fromId", "toId") FROM stdin;
\.


--
-- Data for Name: _admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._admins ("A", "B") FROM stdin;
1	4
2	4
3	4
4	3
5	3
\.


--
-- Data for Name: _banned; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._banned ("A", "B") FROM stdin;
\.


--
-- Data for Name: _friendship; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._friendship ("A", "B") FROM stdin;
\.


--
-- Data for Name: _joined; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._joined ("A", "B") FROM stdin;
1	4
2	4
3	4
4	3
5	3
\.


--
-- Data for Name: _kicked; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._kicked ("A", "B") FROM stdin;
\.


--
-- Data for Name: _muted; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._muted ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e3a35b1d-8ddc-4111-aadd-a27e93d05c56	756e3d7654e11964c613122bdf956ab0a8061c547271a19be0c0371ad827fe96	2023-10-05 14:22:00.901668+00	20231005142200_init	\N	\N	2023-10-05 14:22:00.836594+00	1
\.


--
-- Data for Name: channels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.channels (id, date, "updatedAt", mode, password, name, "ownerId") FROM stdin;
1	2023-10-05 14:43:11.7	2023-10-05 14:43:11.705	PUBLIC	\N	chan1	4
2	2023-10-05 14:43:56.323	2023-10-05 14:43:56.364	PUBLIC	\N	chan4	4
3	2023-10-05 14:45:09.029	2023-10-05 14:45:09.07	PROTECTED	26ac86aa9ae7a6e38f11ed684a4d21cb$7b8529bc9127a3fce056aff9cd8436c15938811999f59aaf0e589752ae4074821aaefe419b4c6f94ccec35a5ff17c0c48759beb5c47ffac0ce244ca722b404f2	chan4prot	4
4	2023-10-05 15:19:34.965	2023-10-05 15:19:35.007	PUBLIC	\N	chan3pub	3
5	2023-10-05 15:19:46.835	2023-10-05 15:19:46.839	PROTECTED	0a1f5742fe99d0d0600fe607ec64447e$cc78eef91b88a43ad3fc9446d2e593599183488f34bb57cb2d448a2f9198f6f2772ba9b25844685e099b0e58d389e6c1c232846731bb359cb869196f4c472559	chan3prot	3
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, date, "fromId", "to", content, "channelId") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, nickname, "createdAt", "updatedAt", avatar, bio, "authenticationSecret", "authenticationEnabled") FROM stdin;
1	test1	f3a171abf7572d30bac5483f695db35f$8031b3fc2c77ae8964618b96d5793e89ffe98083936900552b58bd340857b6eec9361390eaead2a72168ce4141fa273e6b8a1a8931ded49c363ca5ec36e6a4d6	test1	2023-10-05 14:39:14.502	2023-10-05 14:39:14.502	\N	\N	\N	f
2	test2	8cab053c1b5a48a5bfd78657a0cbd7e7$f8ddacf1c6549e10efbb51cb8eddbda0da37c41ef26a61733b0fb7ceead3a7d865b2af6b48d29cc90161182d25306f28e87eeff6926505f99b4fd556c99b5ff1	test2	2023-10-05 14:41:23.533	2023-10-05 14:41:23.533	\N	\N	\N	f
3	test3	d9b2129b0f9200512fa59cc8a2e37713$85b8436f81fa7932965cae068ac0378e7dfd22d2c597c8875a7aed7c79c866bf6e8b915a6aa3cad0abce655f36efdd28111c5b832f646756f584693c9285a654	test3	2023-10-05 14:41:51.573	2023-10-05 14:41:51.573	\N	\N	\N	f
4	test4	15b16d4bea7a27566b40392aec24357b$d384b44ebb760f30d221ceab8ef46fa391cfbcac36e07278e2c244adbc0daa40830b779f038d96e62aa50dedd9812fe029b74a38b717f93df3d6e825f6ac8377	test4	2023-10-05 14:42:13.899	2023-10-05 14:42:13.899	\N	\N	\N	f
5	test5	5cf1f4e19436b3c496618e29f14aa371$1e5fe77c92275ced4b2cfe80ea679e7d86b275f4b4318a13c036dea72ac842552e4bfdcb4f36abd7d88675a1115e9f051b28a24fde6aa01d0f29a771cf09f8ea	test5	2023-10-05 14:57:13.475	2023-10-05 14:57:13.475	\N	\N	\N	f
\.


--
-- Name: FriendRequest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."FriendRequest_id_seq"', 1, false);


--
-- Name: channels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.channels_id_seq', 5, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: FriendRequest FriendRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FriendRequest"
    ADD CONSTRAINT "FriendRequest_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: _admins_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_admins_AB_unique" ON public._admins USING btree ("A", "B");


--
-- Name: _admins_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_admins_B_index" ON public._admins USING btree ("B");


--
-- Name: _banned_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_banned_AB_unique" ON public._banned USING btree ("A", "B");


--
-- Name: _banned_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_banned_B_index" ON public._banned USING btree ("B");


--
-- Name: _friendship_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_friendship_AB_unique" ON public._friendship USING btree ("A", "B");


--
-- Name: _friendship_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_friendship_B_index" ON public._friendship USING btree ("B");


--
-- Name: _joined_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_joined_AB_unique" ON public._joined USING btree ("A", "B");


--
-- Name: _joined_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_joined_B_index" ON public._joined USING btree ("B");


--
-- Name: _kicked_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_kicked_AB_unique" ON public._kicked USING btree ("A", "B");


--
-- Name: _kicked_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_kicked_B_index" ON public._kicked USING btree ("B");


--
-- Name: _muted_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_muted_AB_unique" ON public._muted USING btree ("A", "B");


--
-- Name: _muted_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_muted_B_index" ON public._muted USING btree ("B");


--
-- Name: channels_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX channels_name_key ON public.channels USING btree (name);


--
-- Name: users_nickname_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_nickname_key ON public.users USING btree (nickname);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: FriendRequest FriendRequest_fromId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FriendRequest"
    ADD CONSTRAINT "FriendRequest_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FriendRequest FriendRequest_toId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FriendRequest"
    ADD CONSTRAINT "FriendRequest_toId_fkey" FOREIGN KEY ("toId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _admins _admins_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._admins
    ADD CONSTRAINT "_admins_A_fkey" FOREIGN KEY ("A") REFERENCES public.channels(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _admins _admins_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._admins
    ADD CONSTRAINT "_admins_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _banned _banned_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._banned
    ADD CONSTRAINT "_banned_A_fkey" FOREIGN KEY ("A") REFERENCES public.channels(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _banned _banned_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._banned
    ADD CONSTRAINT "_banned_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _friendship _friendship_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._friendship
    ADD CONSTRAINT "_friendship_A_fkey" FOREIGN KEY ("A") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _friendship _friendship_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._friendship
    ADD CONSTRAINT "_friendship_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _joined _joined_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._joined
    ADD CONSTRAINT "_joined_A_fkey" FOREIGN KEY ("A") REFERENCES public.channels(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _joined _joined_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._joined
    ADD CONSTRAINT "_joined_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _kicked _kicked_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._kicked
    ADD CONSTRAINT "_kicked_A_fkey" FOREIGN KEY ("A") REFERENCES public.channels(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _kicked _kicked_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._kicked
    ADD CONSTRAINT "_kicked_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _muted _muted_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._muted
    ADD CONSTRAINT "_muted_A_fkey" FOREIGN KEY ("A") REFERENCES public.channels(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _muted _muted_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._muted
    ADD CONSTRAINT "_muted_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: channels channels_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT "channels_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: messages messages_channelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES public.channels(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: messages messages_fromId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

