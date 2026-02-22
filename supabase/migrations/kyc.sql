-- 1. Table kyc_demandes
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS kyc_demandes (
  id_demande        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur    UUID NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
  url_recto         TEXT NOT NULL,
  url_verso         TEXT NOT NULL,
  url_selfie        TEXT NOT NULL,
  statut            TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_cours_review', 'approuve', 'rejete')),
  motif_rejet       TEXT,
  date_soumission   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_traitement   TIMESTAMPTZ,
  UNIQUE(id_utilisateur)
);

-- RLS sur kyc_demandes
ALTER TABLE kyc_demandes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Soumission KYC propre" ON kyc_demandes;
CREATE POLICY "Soumission KYC propre"
  ON kyc_demandes FOR INSERT
  WITH CHECK (auth.uid() = id_utilisateur);

DROP POLICY IF EXISTS "Lecture propre KYC" ON kyc_demandes;
CREATE POLICY "Lecture propre KYC"
  ON kyc_demandes FOR SELECT
  USING (auth.uid() = id_utilisateur);

DROP POLICY IF EXISTS "Modification propre KYC" ON kyc_demandes;
CREATE POLICY "Modification propre KYC"
  ON kyc_demandes FOR UPDATE
  USING (auth.uid() = id_utilisateur);

-- 2. Bucket Storage kyc-documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', FALSE)
ON CONFLICT (id) DO NOTHING;

-- RLS sur kyc-documents (privé)
DROP POLICY IF EXISTS "Upload kyc propre" ON storage.objects;
CREATE POLICY "Upload kyc propre"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Lecture kyc propre" ON storage.objects;
CREATE POLICY "Lecture kyc propre"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Suppression kyc propre" ON storage.objects;
CREATE POLICY "Suppression kyc propre"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
