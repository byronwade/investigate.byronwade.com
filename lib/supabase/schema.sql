-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Investigations table
CREATE TABLE investigations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    total_files INTEGER DEFAULT 0,
    processed_files INTEGER DEFAULT 0,
    total_size BIGINT DEFAULT 0
);

-- Evidence files table
CREATE TABLE evidence_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    checksum TEXT NOT NULL,
    upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'uploaded', 'processing', 'completed', 'failed')),
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- AI Analysis results table
CREATE TABLE ai_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_id UUID REFERENCES evidence_files(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('ocr', 'object_detection', 'face_recognition', 'audio_transcription', 'metadata_extraction')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    results JSONB DEFAULT '{}'::jsonb,
    confidence_scores JSONB DEFAULT '{}'::jsonb,
    processing_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entities table (people, places, objects, etc.)
CREATE TABLE entities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('person', 'location', 'object', 'organization', 'event')),
    name TEXT NOT NULL,
    description TEXT,
    confidence FLOAT NOT NULL DEFAULT 0.0,
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timeline events table
CREATE TABLE timeline_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    file_id UUID REFERENCES evidence_files(id) ON DELETE SET NULL,
    entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type TEXT DEFAULT 'detected_event' CHECK (event_type IN ('file_creation', 'file_modification', 'detected_event', 'manual_entry')),
    location JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entity relationships table
CREATE TABLE entity_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    source_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    target_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0.0,
    evidence_files TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_entity_id, target_entity_id, relationship_type)
);

-- Processing jobs table
CREATE TABLE processing_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_id UUID REFERENCES evidence_files(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_evidence_files_investigation ON evidence_files(investigation_id);
CREATE INDEX idx_evidence_files_status ON evidence_files(processing_status);
CREATE INDEX idx_ai_analysis_file ON ai_analysis(file_id);
CREATE INDEX idx_ai_analysis_type ON ai_analysis(analysis_type);
CREATE INDEX idx_entities_investigation ON entities(investigation_id);
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_timeline_investigation ON timeline_events(investigation_id);
CREATE INDEX idx_timeline_date ON timeline_events(event_date);
CREATE INDEX idx_processing_jobs_file ON processing_jobs(file_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);

-- Full-text search indexes
CREATE INDEX idx_entities_name_gin ON entities USING gin(name gin_trgm_ops);
CREATE INDEX idx_evidence_files_name_gin ON evidence_files USING gin(original_name gin_trgm_ops);
CREATE INDEX idx_ai_analysis_results_gin ON ai_analysis USING gin(results);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investigations_updated_at BEFORE UPDATE ON investigations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidence_files_updated_at BEFORE UPDATE ON evidence_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analysis_updated_at BEFORE UPDATE ON ai_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_events_updated_at BEFORE UPDATE ON timeline_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entity_relationships_updated_at BEFORE UPDATE ON entity_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_jobs_updated_at BEFORE UPDATE ON processing_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can only access their own investigations)
CREATE POLICY "Users can view their own investigations" ON investigations
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create investigations" ON investigations
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own investigations" ON investigations
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own investigations" ON investigations
    FOR DELETE USING (auth.uid() = created_by);

-- Evidence files policies
CREATE POLICY "Users can view files in their investigations" ON evidence_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM investigations 
            WHERE investigations.id = evidence_files.investigation_id 
            AND investigations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert files in their investigations" ON evidence_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM investigations 
            WHERE investigations.id = evidence_files.investigation_id 
            AND investigations.created_by = auth.uid()
        )
    );

-- Storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence-files', 'evidence-files', false);

-- Storage policies
CREATE POLICY "Users can upload evidence files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'evidence-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their evidence files" ON storage.objects
    FOR SELECT USING (bucket_id = 'evidence-files' AND auth.role() = 'authenticated');

-- Create search function
CREATE OR REPLACE FUNCTION search_evidence(
    investigation_uuid UUID,
    search_query TEXT,
    file_types TEXT[] DEFAULT NULL,
    confidence_min FLOAT DEFAULT 0.0
)
RETURNS TABLE (
    file_id UUID,
    file_name TEXT,
    analysis_results JSONB,
    entities_found JSONB,
    relevance_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ef.id,
        ef.original_name,
        COALESCE(ai.results, '{}'::jsonb) as analysis_results,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', e.id,
                    'name', e.name,
                    'type', e.type,
                    'confidence', e.confidence
                )
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'::jsonb
        ) as entities_found,
        GREATEST(
            similarity(ef.original_name, search_query),
            COALESCE(
                (ai.results->>'text_content')::TEXT <-> search_query::TEXT,
                0.0
            )
        ) as relevance_score
    FROM evidence_files ef
    LEFT JOIN ai_analysis ai ON ef.id = ai.file_id
    LEFT JOIN entities e ON e.investigation_id = ef.investigation_id
    WHERE ef.investigation_id = investigation_uuid
        AND (file_types IS NULL OR ef.file_type = ANY(file_types))
        AND ef.original_name % search_query
    GROUP BY ef.id, ef.original_name, ai.results
    HAVING GREATEST(
        similarity(ef.original_name, search_query),
        COALESCE(
            (ai.results->>'text_content')::TEXT <-> search_query::TEXT,
            0.0
        )
    ) >= confidence_min
    ORDER BY relevance_score DESC;
END;
$$ LANGUAGE plpgsql;