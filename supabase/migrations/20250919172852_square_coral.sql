/*
  # Digital Labour Chowk Database Schema

  1. New Tables
    - `users` - Main user profiles for buyers, workers, and admins
    - `workers` - Extended profile for workers with skills and rates
    - `service_requests` - Job postings from buyers
    - `job_assignments` - Worker assignments to jobs
    - `sobriety_checks` - AI-powered sobriety verification records
    - `payments` - Payment tracking and processing

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Secure video storage access

  3. Features
    - Auto-assignment algorithm support
    - Gemini AI integration for sobriety checks
    - Real-time job status updates
    - Comprehensive payment tracking
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (main profiles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_type VARCHAR(20) CHECK (user_type IN ('buyer', 'worker', 'admin')) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(100),
  profile_image_url TEXT,
  location JSONB, -- {latitude, longitude, address}
  verification_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workers extended profile
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  skills TEXT[] NOT NULL DEFAULT '{}',
  experience_years INTEGER,
  hourly_rate DECIMAL(10,2),
  availability_status VARCHAR(20) DEFAULT 'available',
  total_jobs_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  sobriety_check_history JSONB[] DEFAULT '{}',
  last_sobriety_check TIMESTAMP WITH TIME ZONE,
  government_id_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service requests (job postings)
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  location JSONB, -- Job location
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  urgency_level VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  estimated_duration INTEGER, -- in hours
  preferred_worker_id UUID REFERENCES workers(id),
  auto_assign BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job assignments
CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE NOT NULL,
  assignment_type VARCHAR(20) CHECK (assignment_type IN ('manual', 'auto')) NOT NULL,
  status VARCHAR(30) DEFAULT 'assigned',
  sobriety_check_required BOOLEAN DEFAULT true,
  sobriety_check_status VARCHAR(20) DEFAULT 'pending',
  work_started_at TIMESTAMP WITH TIME ZONE,
  work_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sobriety checks
CREATE TABLE IF NOT EXISTS sobriety_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_assignment_id UUID REFERENCES job_assignments(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  gemini_analysis JSONB,
  status VARCHAR(20) CHECK (status IN ('pass', 'fail', 'uncertain', 'pending')) DEFAULT 'pending',
  confidence_score DECIMAL(4,3),
  detected_issues TEXT[] DEFAULT '{}',
  manual_review_required BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_assignment_id UUID REFERENCES job_assignments(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2),
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  transaction_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sobriety_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can create user profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for workers table
CREATE POLICY "Workers can manage own profile" ON workers
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Anyone can read worker profiles" ON workers
  FOR SELECT USING (true);

-- RLS Policies for service_requests table
CREATE POLICY "Buyers can manage own requests" ON service_requests
  FOR ALL USING (auth.uid() = buyer_id);

CREATE POLICY "Workers can read open requests" ON service_requests
  FOR SELECT USING (status = 'open');

-- RLS Policies for job_assignments table
CREATE POLICY "Users can read own assignments" ON job_assignments
  FOR SELECT USING (
    auth.uid() = worker_id OR 
    auth.uid() IN (SELECT buyer_id FROM service_requests WHERE id = service_request_id)
  );

CREATE POLICY "System can create assignments" ON job_assignments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own assignments" ON job_assignments
  FOR UPDATE USING (
    auth.uid() = worker_id OR 
    auth.uid() IN (SELECT buyer_id FROM service_requests WHERE id = service_request_id)
  );

-- RLS Policies for sobriety_checks table
CREATE POLICY "Workers can read own checks" ON sobriety_checks
  FOR SELECT USING (auth.uid() = worker_id);

CREATE POLICY "Workers can create own checks" ON sobriety_checks
  FOR INSERT WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Admins can read all checks" ON sobriety_checks
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE user_type = 'admin')
  );

-- RLS Policies for payments table
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = worker_id);

CREATE POLICY "System can create payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_workers_skills ON workers USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_workers_availability ON workers(availability_status);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_buyer ON service_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_worker ON job_assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_status ON job_assignments(status);
CREATE INDEX IF NOT EXISTS idx_sobriety_checks_worker ON sobriety_checks(worker_id);
CREATE INDEX IF NOT EXISTS idx_sobriety_checks_status ON sobriety_checks(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to users table
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();