-- Enhanced security schema additions to the existing schema
-- Run this after the main schema.sql

-- User profiles table for extended user information
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT DEFAULT 'investigator' CHECK (role IN ('admin', 'investigator', 'viewer')),
    department TEXT,
    organization TEXT,
    phone TEXT,
    avatar_url TEXT,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table for tracking all security-relevant actions
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investigation access permissions table
CREATE TABLE investigation_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_level TEXT DEFAULT 'viewer' CHECK (permission_level IN ('owner', 'editor', 'viewer')),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(investigation_id, user_id)
);

-- User sessions tracking for security
CREATE TABLE user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data encryption keys table (for field-level encryption)
CREATE TABLE encryption_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key_name TEXT NOT NULL UNIQUE,
    encrypted_key TEXT NOT NULL,
    algorithm TEXT DEFAULT 'AES-256-GCM',
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rotated_at TIMESTAMP WITH TIME ZONE
);

-- Failed login attempts tracking
CREATE TABLE failed_login_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    attempt_count INTEGER DEFAULT 1,
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced evidence files with encryption and access logging
ALTER TABLE evidence_files ADD COLUMN IF NOT EXISTS encrypted BOOLEAN DEFAULT FALSE;
ALTER TABLE evidence_files ADD COLUMN IF NOT EXISTS encryption_key_id UUID REFERENCES encryption_keys(id);
ALTER TABLE evidence_files ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'restricted' CHECK (access_level IN ('public', 'internal', 'confidential', 'restricted'));
ALTER TABLE evidence_files ADD COLUMN IF NOT EXISTS retention_date TIMESTAMP WITH TIME ZONE;

-- File access logs
CREATE TABLE file_access_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_id UUID REFERENCES evidence_files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'analyze', 'delete')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for security tables
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_risk_level ON audit_logs(risk_level);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_organization ON user_profiles(organization);
CREATE INDEX idx_investigation_permissions_user ON investigation_permissions(user_id);
CREATE INDEX idx_investigation_permissions_investigation ON investigation_permissions(investigation_id);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX idx_failed_login_attempts_ip ON failed_login_attempts(ip_address);
CREATE INDEX idx_file_access_logs_file ON file_access_logs(file_id);
CREATE INDEX idx_file_access_logs_user ON file_access_logs(user_id);

-- Updated triggers for new tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_failed_login_attempts_updated_at BEFORE UPDATE ON failed_login_attempts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enhanced RLS policies

-- User profiles - users can only see their own profile and limited info of others
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view basic info of other users" ON user_profiles
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        id != auth.uid()
    );

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Audit logs - users can only see their own audit logs, admins can see all
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Investigation permissions
ALTER TABLE investigation_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view permissions for their investigations" ON investigation_permissions
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM investigations 
            WHERE investigations.id = investigation_permissions.investigation_id 
            AND investigations.created_by = auth.uid()
        )
    );

-- File access logs
ALTER TABLE file_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own file access logs" ON file_access_logs
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM evidence_files ef
            JOIN investigations i ON ef.investigation_id = i.id
            WHERE ef.id = file_access_logs.file_id 
            AND i.created_by = auth.uid()
        )
    );

-- Enhanced investigation policies with permissions
DROP POLICY IF EXISTS "Users can view their own investigations" ON investigations;
DROP POLICY IF EXISTS "Users can update their own investigations" ON investigations;
DROP POLICY IF EXISTS "Users can delete their own investigations" ON investigations;

CREATE POLICY "Users can view investigations they own or have permission to" ON investigations
    FOR SELECT USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM investigation_permissions ip
            WHERE ip.investigation_id = investigations.id 
            AND ip.user_id = auth.uid()
            AND (ip.expires_at IS NULL OR ip.expires_at > NOW())
        )
    );

CREATE POLICY "Users can update investigations they own or have editor permission" ON investigations
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM investigation_permissions ip
            WHERE ip.investigation_id = investigations.id 
            AND ip.user_id = auth.uid()
            AND ip.permission_level IN ('owner', 'editor')
            AND (ip.expires_at IS NULL OR ip.expires_at > NOW())
        )
    );

CREATE POLICY "Users can delete investigations they own" ON investigations
    FOR DELETE USING (auth.uid() = created_by);

-- Functions for audit logging
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_risk_level TEXT DEFAULT 'low'
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, 
        details, risk_level
    ) VALUES (
        p_user_id, p_action, p_resource_type, p_resource_id,
        p_details, p_risk_level
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_investigation_permission(
    p_investigation_id UUID,
    p_user_id UUID,
    p_required_level TEXT DEFAULT 'viewer'
) RETURNS BOOLEAN AS $$
DECLARE
    is_owner BOOLEAN;
    has_permission BOOLEAN;
BEGIN
    -- Check if user is the owner
    SELECT EXISTS(
        SELECT 1 FROM investigations 
        WHERE id = p_investigation_id AND created_by = p_user_id
    ) INTO is_owner;
    
    IF is_owner THEN
        RETURN TRUE;
    END IF;
    
    -- Check permissions table
    SELECT EXISTS(
        SELECT 1 FROM investigation_permissions 
        WHERE investigation_id = p_investigation_id 
        AND user_id = p_user_id
        AND (
            permission_level = 'owner' OR
            (p_required_level = 'viewer' AND permission_level IN ('owner', 'editor', 'viewer')) OR
            (p_required_level = 'editor' AND permission_level IN ('owner', 'editor'))
        )
        AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- Function to track failed login attempts
CREATE OR REPLACE FUNCTION track_failed_login(
    p_email TEXT,
    p_ip_address INET,
    p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    attempt_record RECORD;
    block_duration INTERVAL := '15 minutes';
    max_attempts INTEGER := 5;
BEGIN
    -- Get existing record
    SELECT * FROM failed_login_attempts 
    WHERE email = p_email AND ip_address = p_ip_address
    INTO attempt_record;
    
    IF FOUND THEN
        -- Update existing record
        UPDATE failed_login_attempts 
        SET 
            attempt_count = attempt_count + 1,
            updated_at = NOW(),
            blocked_until = CASE 
                WHEN attempt_count + 1 >= max_attempts 
                THEN NOW() + block_duration 
                ELSE blocked_until 
            END
        WHERE email = p_email AND ip_address = p_ip_address;
    ELSE
        -- Create new record
        INSERT INTO failed_login_attempts (
            email, ip_address, user_agent, attempt_count
        ) VALUES (
            p_email, p_ip_address, p_user_agent, 1
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if login is blocked
CREATE OR REPLACE FUNCTION is_login_blocked(
    p_email TEXT,
    p_ip_address INET
) RETURNS BOOLEAN AS $$
DECLARE
    is_blocked BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM failed_login_attempts
        WHERE email = p_email 
        AND ip_address = p_ip_address
        AND blocked_until IS NOT NULL 
        AND blocked_until > NOW()
    ) INTO is_blocked;
    
    RETURN is_blocked;
END;
$$ LANGUAGE plpgsql;

-- Function to clear failed login attempts on successful login
CREATE OR REPLACE FUNCTION clear_failed_login_attempts(
    p_email TEXT,
    p_ip_address INET
) RETURNS VOID AS $$
BEGIN
    DELETE FROM failed_login_attempts 
    WHERE email = p_email AND ip_address = p_ip_address;
END;
$$ LANGUAGE plpgsql;