
-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Tables

-- QUARTIERS
CREATE TABLE quartiers (
  id_quartier     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom_quartier    TEXT NOT NULL UNIQUE
);

INSERT INTO quartiers (nom_quartier) VALUES
  ('Majengo'),
  ('Mbugangari'),
  ('Bugoyi'),
  ('Rubavu'),
  ('Bigogwe'),
  ('Mudende'),
  ('Rwerere'),
  ('Nyakiriba'),
  ('Centre-Ville'),
  ('Bord du Lac');

-- UTILISATEURS
CREATE TABLE utilisateurs (
  id_utilisateur      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_complet         TEXT NOT NULL,
  numero_telephone    TEXT NOT NULL UNIQUE,
  role                TEXT NOT NULL DEFAULT 'locataire' 
                        CHECK (role IN ('locataire', 'proprietaire', 'administrateur')),
  statut_verification BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url          TEXT,
  date_inscription    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROPRIETES
CREATE TABLE proprietes (
  id_propriete        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur      UUID NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
  id_quartier         UUID NOT NULL REFERENCES quartiers(id_quartier),
  titre               TEXT NOT NULL,
  description         TEXT NOT NULL,
  prix_mensuel        INTEGER NOT NULL CHECK (prix_mensuel > 0),
  garantie_exigee     INTEGER NOT NULL DEFAULT 1 CHECK (garantie_exigee >= 0),
  nombre_chambres     INTEGER NOT NULL CHECK (nombre_chambres > 0),
  nombre_salons       INTEGER NOT NULL DEFAULT 1 CHECK (nombre_salons >= 0),
  has_eau             BOOLEAN NOT NULL DEFAULT FALSE,
  has_electricite     BOOLEAN NOT NULL DEFAULT FALSE,
  has_cloture         BOOLEAN NOT NULL DEFAULT FALSE,
  has_parking         BOOLEAN NOT NULL DEFAULT FALSE,
  statut              TEXT NOT NULL DEFAULT 'disponible'
                        CHECK (statut IN ('disponible', 'en_cours', 'loue')),
  latitude            DOUBLE PRECISION,
  longitude           DOUBLE PRECISION,
  date_publication    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PHOTOS
CREATE TABLE photos (
  id_photo              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_propriete          UUID NOT NULL REFERENCES proprietes(id_propriete) ON DELETE CASCADE,
  url_photo             TEXT NOT NULL,
  est_photo_principale  BOOLEAN NOT NULL DEFAULT FALSE
);

-- CONVERSATIONS
CREATE TABLE conversations (
  id_conversation     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_locataire        UUID NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
  id_proprietaire     UUID NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
  id_propriete        UUID NOT NULL REFERENCES proprietes(id_propriete) ON DELETE CASCADE,
  date_creation       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  derniere_activite   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_locataire, id_propriete)
);

-- MESSAGES
CREATE TABLE messages (
  id_message        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_conversation   UUID NOT NULL REFERENCES conversations(id_conversation) ON DELETE CASCADE,
  id_expediteur     UUID NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
  contenu           TEXT NOT NULL,
  type              TEXT NOT NULL DEFAULT 'texte'
                      CHECK (type IN ('texte', 'visite_proposee', 'visite_confirmee')),
  date_envoi        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lu                BOOLEAN NOT NULL DEFAULT FALSE
);

-- VISITES
CREATE TABLE visites (
  id_visite         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_conversation   UUID NOT NULL REFERENCES conversations(id_conversation) ON DELETE CASCADE,
  date_visite       TIMESTAMPTZ NOT NULL,
  statut            TEXT NOT NULL DEFAULT 'proposee'
                      CHECK (statut IN ('proposee', 'confirmee', 'annulee')),
  date_creation     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SIGNALEMENTS
CREATE TABLE signalements (
  id_signalement    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur    UUID NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
  id_propriete      UUID NOT NULL REFERENCES proprietes(id_propriete) ON DELETE CASCADE,
  motif             TEXT NOT NULL,
  date_signalement  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  etat_traitement   TEXT NOT NULL DEFAULT 'en_attente'
                      CHECK (etat_traitement IN ('en_attente', 'resolu', 'rejete')),
  UNIQUE (id_utilisateur, id_propriete)
);

-- 3. Triggers

-- Trigger creation profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.utilisateurs (id_utilisateur, nom_complet, numero_telephone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom_complet', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'numero_telephone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'locataire')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger activite conversation
CREATE OR REPLACE FUNCTION public.update_conversation_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET derniere_activite = NOW()
  WHERE id_conversation = NEW.id_conversation;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_activity();

-- 4. RLS

ALTER TABLE utilisateurs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE proprietes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE visites          ENABLE ROW LEVEL SECURITY;
ALTER TABLE signalements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE quartiers        ENABLE ROW LEVEL SECURITY;

-- Quartiers
CREATE POLICY "Lecture publique quartiers" ON quartiers FOR SELECT USING (TRUE);

-- Utilisateurs
CREATE POLICY "Lecture publique profil" ON utilisateurs FOR SELECT USING (TRUE);
CREATE POLICY "Modification propre profil" ON utilisateurs FOR UPDATE USING (auth.uid() = id_utilisateur);

-- Proprietes
CREATE POLICY "Lecture publique proprietes disponibles" ON proprietes FOR SELECT USING (statut = 'disponible' OR id_utilisateur = auth.uid());
CREATE POLICY "Insertion par proprietaire authentifie" ON proprietes FOR INSERT WITH CHECK (auth.uid() = id_utilisateur);
CREATE POLICY "Modification par le proprietaire" ON proprietes FOR UPDATE USING (auth.uid() = id_utilisateur);
CREATE POLICY "Suppression par le proprietaire" ON proprietes FOR DELETE USING (auth.uid() = id_utilisateur);

-- Photos
CREATE POLICY "Lecture publique photos" ON photos FOR SELECT USING (TRUE);
CREATE POLICY "Insertion photos par proprietaire" ON photos FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM proprietes p WHERE p.id_propriete = photos.id_propriete AND p.id_utilisateur = auth.uid()));
CREATE POLICY "Suppression photos par proprietaire" ON photos FOR DELETE USING (EXISTS (SELECT 1 FROM proprietes p WHERE p.id_propriete = photos.id_propriete AND p.id_utilisateur = auth.uid()));

-- Conversations
CREATE POLICY "Acces conversation participants" ON conversations FOR SELECT USING (auth.uid() = id_locataire OR auth.uid() = id_proprietaire);
CREATE POLICY "Creation conversation par locataire" ON conversations FOR INSERT WITH CHECK (auth.uid() = id_locataire);

-- Messages
CREATE POLICY "Lecture messages par participants" ON messages FOR SELECT USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id_conversation = messages.id_conversation AND (c.id_locataire = auth.uid() OR c.id_proprietaire = auth.uid())));
CREATE POLICY "Envoi message par participant" ON messages FOR INSERT WITH CHECK (auth.uid() = id_expediteur AND EXISTS (SELECT 1 FROM conversations c WHERE c.id_conversation = messages.id_conversation AND (c.id_locataire = auth.uid() OR c.id_proprietaire = auth.uid())));

-- Visites
CREATE POLICY "Acces visites par participants" ON visites FOR SELECT USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id_conversation = visites.id_conversation AND (c.id_locataire = auth.uid() OR c.id_proprietaire = auth.uid())));
CREATE POLICY "Proposition visite par participant" ON visites FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM conversations c WHERE c.id_conversation = visites.id_conversation AND (c.id_locataire = auth.uid() OR c.id_proprietaire = auth.uid())));
CREATE POLICY "Modification statut visite par participant" ON visites FOR UPDATE USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id_conversation = visites.id_conversation AND (c.id_locataire = auth.uid() OR c.id_proprietaire = auth.uid())));

-- Signalements
CREATE POLICY "Creation signalement utilisateur connecte" ON signalements FOR INSERT WITH CHECK (auth.uid() = id_utilisateur);
CREATE POLICY "Lecture propre signalement" ON signalements FOR SELECT USING (auth.uid() = id_utilisateur);

-- 5. Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('property-photos', 'property-photos', TRUE), ('kyc-documents', 'kyc-documents', FALSE);

CREATE POLICY "Upload photos proprietes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Lecture publique photos proprietes" ON storage.objects FOR SELECT USING (bucket_id = 'property-photos');

CREATE POLICY "Upload documents KYC" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND auth.role() = 'authenticated');
CREATE POLICY "Lecture KYC admin seulement" ON storage.objects FOR SELECT USING (bucket_id = 'kyc-documents' AND auth.uid() = (SELECT id_utilisateur FROM utilisateurs WHERE id_utilisateur = auth.uid() AND role = 'administrateur'));
