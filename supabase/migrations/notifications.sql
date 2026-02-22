-- Run this in your Supabase SQL Editor to apply Schema Updates for Notifications

-- 1. Add push_token to utilisateurs
ALTER TABLE utilisateurs 
ADD COLUMN push_token TEXT;

-- 2. Create notification_tokens table
CREATE TABLE notification_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_utilisateur  UUID NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    token           TEXT NOT NULL,
    platform        TEXT CHECK (platform IN ('ios', 'android')),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(id_utilisateur)
);

-- 3. RLS Policies
ALTER TABLE notification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestion propre token"
    ON notification_tokens FOR ALL
    USING (auth.uid() = id_utilisateur)
    WITH CHECK (auth.uid() = id_utilisateur);
