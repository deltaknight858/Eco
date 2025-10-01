/**
 * Database Schema Design for Capsule + Provenance Storage
 * PostgreSQL schema for comprehensive capsule lifecycle tracking
 */

-- ================================
-- CORE CAPSULE TABLES
-- ================================

-- Capsules table - main capsule registry
CREATE TABLE capsules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly name
    description TEXT NOT NULL,
    version VARCHAR(50) NOT NULL,
    category capsule_category NOT NULL,
    
    -- Creator information
    created_by UUID NOT NULL, -- References auth.users
    organization_id UUID, -- Optional organization
    
    -- Status tracking
    status capsule_status NOT NULL DEFAULT 'draft',
    visibility capsule_visibility NOT NULL DEFAULT 'private',
    
    -- Content metadata
    source_code JSONB NOT NULL DEFAULT '{}', -- FileMap structure
    assets JSONB NOT NULL DEFAULT '{}', -- AssetMap structure
    documentation TEXT DEFAULT '',
    examples JSONB NOT NULL DEFAULT '{}', -- ExampleMap structure
    
    -- Build configuration
    build_config JSONB NOT NULL, -- BuildSpec
    test_config JSONB NOT NULL, -- TestSpec  
    deployment_config JSONB NOT NULL, -- DeploymentSpec
    dependencies TEXT[] DEFAULT '{}',
    
    -- AI generation metadata
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_provider VARCHAR(50), -- 'openai', 'vertex', 'azure'
    ai_prompt TEXT,
    
    -- Provenance information
    provenance_tier provenance_tier NOT NULL DEFAULT 'bronze',
    confidence_score DECIMAL(3,2) DEFAULT 0.0, -- 0.00 to 1.00
    
    -- Security and verification
    signature TEXT, -- Ed25519 signature
    checksum VARCHAR(128), -- SHA-256 of bundle
    sbom JSONB, -- Software Bill of Materials
    security_scan JSONB, -- Security scan results
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_version CHECK (version ~ '^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$'),
    CONSTRAINT valid_confidence CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    CONSTRAINT name_length CHECK (char_length(name) <= 255),
    CONSTRAINT description_length CHECK (char_length(description) <= 2000)
);

-- Custom ENUM types
CREATE TYPE capsule_category AS ENUM ('component', 'workflow', 'service', 'documentation');
CREATE TYPE capsule_status AS ENUM ('draft', 'building', 'testing', 'ready', 'published', 'archived', 'error');
CREATE TYPE capsule_visibility AS ENUM ('private', 'organization', 'public');
CREATE TYPE provenance_tier AS ENUM ('bronze', 'silver', 'gold');

-- ================================
-- CAPSULE LIFECYCLE TABLES
-- ================================

-- Capsule builds - track build processes
CREATE TABLE capsule_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    build_number INTEGER NOT NULL,
    
    -- Build metadata
    trigger_type build_trigger_type NOT NULL,
    triggered_by UUID NOT NULL, -- References auth.users
    git_commit VARCHAR(40), -- Git commit hash if applicable
    
    -- Build process
    status build_status NOT NULL DEFAULT 'queued',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Build artifacts
    build_logs JSONB DEFAULT '[]', -- Array of log entries
    artifacts JSONB DEFAULT '{}', -- Build output files
    bundle_url TEXT, -- CDN URL for capsule bundle
    bundle_size BIGINT, -- Bundle size in bytes
    
    -- Test results
    test_results JSONB, -- TestResults structure
    coverage_percentage DECIMAL(5,2),
    
    -- Error information
    error_message TEXT,
    error_details JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_build_number UNIQUE (capsule_id, build_number),
    CONSTRAINT valid_coverage CHECK (coverage_percentage IS NULL OR (coverage_percentage >= 0 AND coverage_percentage <= 100))
);

CREATE TYPE build_trigger_type AS ENUM ('manual', 'git_push', 'scheduled', 'api');
CREATE TYPE build_status AS ENUM ('queued', 'running', 'success', 'failed', 'cancelled');

-- ================================
-- PROVENANCE TRACKING TABLES
-- ================================

-- Provenance events - comprehensive audit trail
CREATE TABLE provenance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    
    -- Event metadata
    event_type provenance_event_type NOT NULL,
    event_category VARCHAR(50) NOT NULL, -- 'creation', 'modification', 'verification', 'distribution'
    
    -- Actor information
    actor_id UUID NOT NULL, -- References auth.users or agent_id
    actor_type actor_type NOT NULL,
    
    -- Event details
    action VARCHAR(100) NOT NULL, -- Specific action taken
    description TEXT,
    metadata JSONB DEFAULT '{}', -- Additional event data
    
    -- Context information
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Impact assessment
    confidence_impact DECIMAL(3,2) DEFAULT 0.0, -- Change in confidence score
    tier_change provenance_tier, -- New tier if changed
    
    -- Relationships
    parent_event_id UUID REFERENCES provenance_events(id),
    related_events UUID[], -- Array of related event IDs
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID, -- References auth.users
    verified_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_confidence_impact CHECK (confidence_impact >= -1.0 AND confidence_impact <= 1.0)
);

CREATE TYPE provenance_event_type AS ENUM (
    'created', 'updated', 'built', 'tested', 'verified', 'signed', 
    'published', 'downloaded', 'forked', 'rated', 'reviewed', 'archived'
);
CREATE TYPE actor_type AS ENUM ('user', 'agent', 'system', 'api');

-- ================================
-- MARKETPLACE TABLES
-- ================================

-- Capsule marketplace entries
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    
    -- Listing information
    title VARCHAR(255) NOT NULL,
    short_description VARCHAR(500) NOT NULL,
    long_description TEXT,
    tags TEXT[] DEFAULT '{}',
    license VARCHAR(100) DEFAULT 'MIT',
    
    -- Marketplace metadata
    featured BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    
    -- Statistics
    download_count BIGINT DEFAULT 0,
    view_count BIGINT DEFAULT 0,
    star_count INTEGER DEFAULT 0,
    fork_count INTEGER DEFAULT 0,
    
    -- Pricing (for future monetization)
    price_tier pricing_tier DEFAULT 'free',
    price_amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- SEO and discovery
    keywords TEXT[],
    readme_content TEXT, -- Processed README for search
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_capsule_listing UNIQUE (capsule_id)
);

CREATE TYPE pricing_tier AS ENUM ('free', 'paid', 'subscription', 'enterprise');

-- Capsule ratings and reviews
CREATE TABLE capsule_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL, -- References auth.users
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    
    -- Review metadata
    verified_download BOOLEAN DEFAULT FALSE, -- Has user actually downloaded this capsule
    helpful_count INTEGER DEFAULT 0,
    reply_to_id UUID REFERENCES capsule_reviews(id), -- For review replies
    
    -- Moderation
    flagged BOOLEAN DEFAULT FALSE,
    flagged_reason VARCHAR(100),
    moderated_by UUID, -- References auth.users
    moderation_action VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_review UNIQUE (capsule_id, reviewer_id),
    CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5)
);

-- ================================
-- SECURITY AND SIGNATURES
-- ================================

-- Cryptographic signatures
CREATE TABLE capsule_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    build_id UUID REFERENCES capsule_builds(id),
    
    -- Signature metadata
    algorithm VARCHAR(50) NOT NULL DEFAULT 'ed25519',
    public_key TEXT NOT NULL,
    signature TEXT NOT NULL,
    
    -- Signing information
    signer_id UUID NOT NULL, -- References auth.users
    signing_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verification_count INTEGER DEFAULT 0,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Key management
    key_fingerprint VARCHAR(128),
    key_algorithm VARCHAR(50) DEFAULT 'ed25519',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_capsule_signature UNIQUE (capsule_id, algorithm, public_key)
);

-- Security vulnerability tracking
CREATE TABLE security_vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    
    -- Vulnerability details
    vulnerability_id VARCHAR(100) NOT NULL, -- CVE or other ID
    severity vulnerability_severity NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Affected components
    component_name VARCHAR(255),
    component_version VARCHAR(100),
    affected_versions TEXT[],
    
    -- Fix information
    fixed_version VARCHAR(100),
    fix_available BOOLEAN DEFAULT FALSE,
    workaround TEXT,
    
    -- Discovery
    discovered_by VARCHAR(255),
    discovery_date DATE,
    disclosure_date DATE,
    
    -- Status
    status vulnerability_status DEFAULT 'open',
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE vulnerability_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE vulnerability_status AS ENUM ('open', 'acknowledged', 'fixed', 'wont_fix', 'false_positive');

-- ================================
-- ANALYTICS AND METRICS
-- ================================

-- Capsule usage analytics
CREATE TABLE capsule_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
    
    -- Event tracking
    event_type analytics_event_type NOT NULL,
    event_data JSONB DEFAULT '{}',
    
    -- User context
    user_id UUID, -- References auth.users (null for anonymous)
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Geographic data
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    
    -- Performance metrics
    load_time_ms INTEGER,
    bundle_size BIGINT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE analytics_event_type AS ENUM (
    'view', 'download', 'install', 'fork', 'star', 'share', 'search_result', 'error'
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Primary lookup indexes
CREATE INDEX idx_capsules_slug ON capsules(slug);
CREATE INDEX idx_capsules_category ON capsules(category);
CREATE INDEX idx_capsules_status ON capsules(status);
CREATE INDEX idx_capsules_visibility ON capsules(visibility);
CREATE INDEX idx_capsules_created_by ON capsules(created_by);
CREATE INDEX idx_capsules_provenance_tier ON capsules(provenance_tier);
CREATE INDEX idx_capsules_created_at ON capsules(created_at DESC);

-- Build tracking indexes
CREATE INDEX idx_capsule_builds_capsule_id ON capsule_builds(capsule_id);
CREATE INDEX idx_capsule_builds_status ON capsule_builds(status);
CREATE INDEX idx_capsule_builds_created_at ON capsule_builds(created_at DESC);

-- Provenance tracking indexes
CREATE INDEX idx_provenance_events_capsule_id ON provenance_events(capsule_id);
CREATE INDEX idx_provenance_events_actor_id ON provenance_events(actor_id);
CREATE INDEX idx_provenance_events_event_type ON provenance_events(event_type);
CREATE INDEX idx_provenance_events_created_at ON provenance_events(created_at DESC);

-- Marketplace indexes
CREATE INDEX idx_marketplace_featured ON marketplace_listings(featured, created_at DESC);
CREATE INDEX idx_marketplace_tags ON marketplace_listings USING GIN(tags);
CREATE INDEX idx_marketplace_keywords ON marketplace_listings USING GIN(keywords);
CREATE INDEX idx_marketplace_download_count ON marketplace_listings(download_count DESC);

-- Review indexes
CREATE INDEX idx_capsule_reviews_capsule_id ON capsule_reviews(capsule_id);
CREATE INDEX idx_capsule_reviews_rating ON capsule_reviews(rating);
CREATE INDEX idx_capsule_reviews_created_at ON capsule_reviews(created_at DESC);

-- Security indexes
CREATE INDEX idx_security_vulnerabilities_capsule_id ON security_vulnerabilities(capsule_id);
CREATE INDEX idx_security_vulnerabilities_severity ON security_vulnerabilities(severity);
CREATE INDEX idx_security_vulnerabilities_status ON security_vulnerabilities(status);

-- Analytics indexes
CREATE INDEX idx_capsule_analytics_capsule_id ON capsule_analytics(capsule_id);
CREATE INDEX idx_capsule_analytics_event_type ON capsule_analytics(event_type);
CREATE INDEX idx_capsule_analytics_created_at ON capsule_analytics(created_at DESC);
CREATE INDEX idx_capsule_analytics_user_id ON capsule_analytics(user_id) WHERE user_id IS NOT NULL;

-- Full-text search indexes
CREATE INDEX idx_capsules_search ON capsules USING GIN(
    to_tsvector('english', name || ' ' || description)
);
CREATE INDEX idx_marketplace_search ON marketplace_listings USING GIN(
    to_tsvector('english', title || ' ' || short_description || ' ' || array_to_string(tags, ' '))
);

-- ================================
-- TRIGGERS AND FUNCTIONS
-- ================================

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_capsules_updated_at 
    BEFORE UPDATE ON capsules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_updated_at 
    BEFORE UPDATE ON marketplace_listings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatic build number assignment
CREATE OR REPLACE FUNCTION assign_build_number()
RETURNS TRIGGER AS $$
BEGIN
    SELECT COALESCE(MAX(build_number), 0) + 1 
    INTO NEW.build_number 
    FROM capsule_builds 
    WHERE capsule_id = NEW.capsule_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER assign_build_number_trigger
    BEFORE INSERT ON capsule_builds
    FOR EACH ROW EXECUTE FUNCTION assign_build_number();

-- Provenance event logging
CREATE OR REPLACE FUNCTION log_capsule_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log creation
    IF TG_OP = 'INSERT' THEN
        INSERT INTO provenance_events (
            capsule_id, event_type, event_category, actor_id, actor_type, 
            action, description, metadata
        ) VALUES (
            NEW.id, 'created', 'creation', NEW.created_by, 'user',
            'capsule_created', 'Capsule created', 
            jsonb_build_object(
                'name', NEW.name,
                'category', NEW.category,
                'version', NEW.version
            )
        );
        RETURN NEW;
    END IF;
    
    -- Log updates
    IF TG_OP = 'UPDATE' THEN
        -- Log status changes
        IF OLD.status != NEW.status THEN
            INSERT INTO provenance_events (
                capsule_id, event_type, event_category, actor_id, actor_type,
                action, description, metadata
            ) VALUES (
                NEW.id, 'updated', 'modification', NEW.created_by, 'user',
                'status_changed', 'Capsule status changed',
                jsonb_build_object(
                    'old_status', OLD.status,
                    'new_status', NEW.status
                )
            );
        END IF;
        
        -- Log tier changes
        IF OLD.provenance_tier != NEW.provenance_tier THEN
            INSERT INTO provenance_events (
                capsule_id, event_type, event_category, actor_id, actor_type,
                action, description, metadata, tier_change, confidence_impact
            ) VALUES (
                NEW.id, 'verified', 'verification', NEW.created_by, 'system',
                'tier_upgraded', 'Provenance tier changed',
                jsonb_build_object(
                    'old_tier', OLD.provenance_tier,
                    'new_tier', NEW.provenance_tier
                ),
                NEW.provenance_tier,
                NEW.confidence_score - OLD.confidence_score
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_capsule_changes_trigger
    AFTER INSERT OR UPDATE ON capsules
    FOR EACH ROW EXECUTE FUNCTION log_capsule_changes();

-- ================================
-- VIEWS FOR COMMON QUERIES
-- ================================

-- Capsule summary view with aggregated data
CREATE VIEW capsule_summary AS
SELECT 
    c.*,
    ml.download_count,
    ml.star_count,
    ml.view_count,
    COALESCE(AVG(cr.rating), 0) AS average_rating,
    COUNT(cr.id) AS review_count,
    (
        SELECT COUNT(*) 
        FROM security_vulnerabilities sv 
        WHERE sv.capsule_id = c.id AND sv.status = 'open'
    ) AS open_vulnerabilities,
    (
        SELECT status 
        FROM capsule_builds cb 
        WHERE cb.capsule_id = c.id 
        ORDER BY cb.created_at DESC 
        LIMIT 1
    ) AS latest_build_status
FROM capsules c
LEFT JOIN marketplace_listings ml ON c.id = ml.capsule_id
LEFT JOIN capsule_reviews cr ON c.id = cr.capsule_id AND cr.flagged = FALSE
GROUP BY c.id, ml.download_count, ml.star_count, ml.view_count;

-- Popular capsules view
CREATE VIEW popular_capsules AS
SELECT 
    cs.*,
    (ml.download_count * 0.4 + ml.star_count * 0.3 + ml.view_count * 0.0001 + 
     COALESCE(cs.average_rating, 0) * 10 * 0.3) AS popularity_score
FROM capsule_summary cs
JOIN marketplace_listings ml ON cs.id = ml.capsule_id
WHERE cs.status = 'published' AND cs.visibility = 'public'
ORDER BY popularity_score DESC;

-- Recent activity view
CREATE VIEW recent_capsule_activity AS
SELECT 
    pe.*,
    c.name AS capsule_name,
    c.slug AS capsule_slug,
    u.email AS actor_email -- Assuming auth.users has email
FROM provenance_events pe
JOIN capsules c ON pe.capsule_id = c.id
LEFT JOIN auth.users u ON pe.actor_id = u.id
ORDER BY pe.created_at DESC;

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================

-- Enable RLS on main tables
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE provenance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_reviews ENABLE ROW LEVEL SECURITY;

-- Capsules access policy
CREATE POLICY "Users can view public capsules" ON capsules
    FOR SELECT USING (visibility = 'public' OR visibility = 'organization');

CREATE POLICY "Users can view own capsules" ON capsules
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own capsules" ON capsules
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own capsules" ON capsules
    FOR UPDATE USING (auth.uid() = created_by);

-- Marketplace listings policy
CREATE POLICY "Anyone can view marketplace listings" ON marketplace_listings
    FOR SELECT USING (true);

CREATE POLICY "Capsule owners can manage listings" ON marketplace_listings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM capsules 
            WHERE capsules.id = marketplace_listings.capsule_id 
            AND capsules.created_by = auth.uid()
        )
    );

-- Reviews policy
CREATE POLICY "Anyone can view non-flagged reviews" ON capsule_reviews
    FOR SELECT USING (flagged = FALSE);

CREATE POLICY "Users can insert own reviews" ON capsule_reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews" ON capsule_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- ================================
-- SAMPLE DATA (for development)
-- ================================

-- Insert sample capsule categories and initial data
-- This would be run in development/staging environments

/*
-- Sample user (assumes auth.users exists)
INSERT INTO auth.users (id, email) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'developer@eco-system.dev');

-- Sample capsule
INSERT INTO capsules (
    id, name, slug, description, version, category, created_by,
    status, visibility, build_config, test_config, deployment_config,
    provenance_tier, confidence_score
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Eco Button Component',
    'eco-button-component',
    'A reusable button component with Eco design system integration',
    '1.0.0',
    'component',
    '550e8400-e29b-41d4-a716-446655440000',
    'published',
    'public',
    '{"commands": ["npm run build"], "environment": {"NODE_ENV": "production"}, "outputDirectory": "dist", "artifacts": ["dist/**"]}',
    '{"framework": "vitest", "commands": ["npm test"], "coverage": {"threshold": 80, "include": ["src/**"], "exclude": ["**/*.test.ts"]}}',
    '{"platform": "vercel", "configuration": {}, "environment": {}}',
    'gold',
    0.95
);

-- Sample marketplace listing
INSERT INTO marketplace_listings (
    capsule_id, title, short_description, tags, download_count, star_count, view_count
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Eco Button - Production Ready',
    'Beautiful, accessible button component with Eco design tokens',
    ARRAY['react', 'button', 'ui', 'component', 'eco'],
    157,
    23,
    1240
);
*/