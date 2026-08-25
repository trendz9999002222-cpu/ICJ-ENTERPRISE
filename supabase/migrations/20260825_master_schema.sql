-- ==============================================================================
-- ICJ ENTERPRISE PLATFORM: MASTER PRODUCTION SCHEMA & SECURITY BLUEPRINT (2026)
-- PostgreSQL / Supabase Sovereign Legal Database Architecture
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS & IDENTITY TABLE
CREATE TABLE IF NOT EXISTS public.icj_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(32),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'member',
    user_type VARCHAR(32) DEFAULT 'member',
    member_level VARCHAR(32) DEFAULT 'BASIC',
    status VARCHAR(32) DEFAULT 'Active',
    verification_status VARCHAR(32) DEFAULT 'Approved',
    password_hash VARCHAR(255) NOT NULL,
    token_balance NUMERIC(12, 2) DEFAULT 10.00,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LEGAL MATTERS & CASES TABLE
CREATE TABLE IF NOT EXISTS public.icj_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(128) UNIQUE NOT NULL,
    cnr_number VARCHAR(64),
    client_id UUID REFERENCES public.icj_users(id) ON DELETE CASCADE,
    advocate_id UUID REFERENCES public.icj_users(id) ON DELETE SET NULL,
    case_title VARCHAR(255) NOT NULL,
    court_tier VARCHAR(64) NOT NULL, -- 'Supreme Court', 'High Court', 'District Court', 'Tehsil', 'Tribunal'
    court_name VARCHAR(255) NOT NULL,
    case_category VARCHAR(64) NOT NULL, -- 'Civil', 'Criminal', 'Revenue', 'Corporate', 'Constitutional'
    milestone_stage INT DEFAULT 1, -- 0 to 4
    status VARCHAR(32) DEFAULT 'Active',
    next_hearing_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CASE DOCUMENTS VAULT TABLE
CREATE TABLE IF NOT EXISTS public.icj_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.icj_cases(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.icj_users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(64) NOT NULL,
    file_size_bytes BIGINT,
    digital_signature_hash VARCHAR(128),
    is_certified_copy BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FINANCIAL TRANSACTIONS & WALLET LEDGER
CREATE TABLE IF NOT EXISTS public.icj_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.icj_users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(32) NOT NULL, -- 'CREDIT', 'DEBIT', 'FEE_ESCROW', 'TOKEN_PURCHASE'
    amount NUMERIC(12, 2) NOT NULL,
    token_delta NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'COMPLETED',
    reference_id VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. IMMUTABLE SECURITY AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.icj_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(128) NOT NULL,
    ip_address VARCHAR(64),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. HIGH-PERFORMANCE INDEXES (OPTIMIZED FOR MILLISECOND QUERIES)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_icj_users_email ON public.icj_users(email);
CREATE INDEX IF NOT EXISTS idx_icj_users_member_id ON public.icj_users(member_id);
CREATE INDEX IF NOT EXISTS idx_icj_cases_client ON public.icj_cases(client_id);
CREATE INDEX IF NOT EXISTS idx_icj_cases_advocate ON public.icj_cases(advocate_id);
CREATE INDEX IF NOT EXISTS idx_icj_cases_cnr ON public.icj_cases(cnr_number);
CREATE INDEX IF NOT EXISTS idx_icj_documents_case ON public.icj_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_icj_transactions_user ON public.icj_transactions(user_id);

-- ==============================================================================
-- 8. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.icj_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icj_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icj_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icj_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icj_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY user_read_own_profile ON public.icj_users
    FOR SELECT USING (auth.uid() = id);

-- Allow advocates and clients to view only their assigned cases
CREATE POLICY case_participant_access ON public.icj_cases
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = advocate_id);
