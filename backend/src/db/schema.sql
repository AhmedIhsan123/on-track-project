-- On-Track schema
-- Run this in the Supabase SQL editor

-- Enum for application stages
CREATE TYPE application_stage AS ENUM (
  'applied',
  'screen',
  'interview',
  'final',
  'offer',
  'rejected',
  'withdrawn'
);

-- Users (mirrors Supabase Auth — populated via auth trigger or manual insert)
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        UNIQUE NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  provider    TEXT        NOT NULL DEFAULT 'email',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Job applications
CREATE TABLE IF NOT EXISTS applications (
  id               UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID               NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_title        TEXT               NOT NULL,
  company_name     TEXT               NOT NULL,
  location         TEXT,
  remote_type      TEXT               CHECK (remote_type IN ('remote', 'hybrid', 'onsite')),
  salary_range     TEXT,
  job_description  TEXT,
  job_url          TEXT,
  stage            application_stage  NOT NULL DEFAULT 'applied',
  date_applied     DATE               NOT NULL DEFAULT CURRENT_DATE,
  date_posted      DATE,
  notes            TEXT,
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every applications row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
