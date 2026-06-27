-- ============================================================
-- Placement Tracker - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

create table if not exists users (
  id bigserial primary key,
  name varchar(100) not null,
  email varchar(120) unique not null,
  password varchar(200) not null,
  role varchar(20) default 'student',
  bio text default '',
  phone varchar(20) default '',
  linkedin varchar(200) default '',
  github varchar(200) default '',
  graduation varchar(10) default '',
  created_at timestamptz default now()
);

create table if not exists students (
  id bigserial primary key,
  user_id bigint unique references users(id) on delete cascade,
  roll_no varchar(20) default '',
  branch varchar(50) default '',
  cgpa float default 0.0,
  year int default 4,
  skills text default '',
  profile_completion int default 0
);

create table if not exists companies (
  id bigserial primary key,
  name varchar(100) not null,
  industry varchar(100) default '',
  domain varchar(100) default '',
  location varchar(100) default '',
  website varchar(200) default '',
  contact_email varchar(120) default '',
  contact_phone varchar(20) default '',
  roles int default 1,
  openings int default 1,
  required_skills text default ''
);

create table if not exists jobs (
  id bigserial primary key,
  company_id bigint references companies(id) on delete cascade,
  role_title varchar(100) not null,
  type varchar(20) default 'Internship',
  stipend float,
  ctc float,
  drive_date date,
  required_skills text default '',
  eligibility_cgpa float default 0.0,
  status varchar(20) default 'Open'
);

create table if not exists applications (
  id bigserial primary key,
  student_id bigint references students(id) on delete cascade,
  job_id bigint references jobs(id) on delete cascade,
  status varchar(20) default 'Applied',
  applied_on date default current_date,
  match_score float default 0.0,
  unique(student_id, job_id)
);

-- Insert a default admin user (password: admin123)
-- bcrypt hash of "admin123"
insert into users (name, email, password, role)
values ('Admin', 'admin@placepro.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
on conflict (email) do nothing;
