--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-09-04 13:24:24

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
-- TOC entry 5 (class 2615 OID 17301)
-- Name: financial_app; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA financial_app;


ALTER SCHEMA financial_app OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 17320)
-- Name: users; Type: TABLE; Schema: financial_app; Owner: postgres
--

CREATE TABLE financial_app.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(200) NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    email character varying(100) NOT NULL,
    phone character varying(20),
    location character varying(100),
    about text,
    company character varying(100),
    city character varying(50),
    state character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_premium boolean DEFAULT false NOT NULL
);


ALTER TABLE financial_app.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 17319)
-- Name: users_id_seq; Type: SEQUENCE; Schema: financial_app; Owner: postgres
--

CREATE SEQUENCE financial_app.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE financial_app.users_id_seq OWNER TO postgres;

--
-- TOC entry 4856 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: financial_app; Owner: postgres
--

ALTER SEQUENCE financial_app.users_id_seq OWNED BY financial_app.users.id;


--
-- TOC entry 4695 (class 2604 OID 17323)
-- Name: users id; Type: DEFAULT; Schema: financial_app; Owner: postgres
--

ALTER TABLE ONLY financial_app.users ALTER COLUMN id SET DEFAULT nextval('financial_app.users_id_seq'::regclass);


--
-- TOC entry 4850 (class 0 OID 17320)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: financial_app; Owner: postgres
--

COPY financial_app.users (id, username, password, first_name, last_name, email, phone, location, about, company, city, state, created_at, is_premium) FROM stdin;
2	huy	$2b$10$/bBPR2gFdztvIOQ6MVLnyuWERjiJg0h1zgmQyNS3q2PRS/R6TqJQC	Quang	Huỳnh	huyquang222004@gmail.com	0337098363	phước thái, long thành	Like books	Nvidia	HCM	North Vietnam	2025-09-03 23:01:37.562694	f
\.


--
-- TOC entry 4857 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: financial_app; Owner: postgres
--

SELECT pg_catalog.setval('financial_app.users_id_seq', 2, true);


--
-- TOC entry 4699 (class 2606 OID 17332)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: financial_app; Owner: postgres
--

ALTER TABLE ONLY financial_app.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4701 (class 2606 OID 17328)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: financial_app; Owner: postgres
--

ALTER TABLE ONLY financial_app.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4703 (class 2606 OID 17330)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: financial_app; Owner: postgres
--

ALTER TABLE ONLY financial_app.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


-- Completed on 2025-09-04 13:24:24

--
-- PostgreSQL database dump complete
--

