CREATE TABLE alertes (
    id_alerte UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    nom_alerte TEXT NOT NULL,
    id_quartier UUID REFERENCES quartiers(id_quartier),
    prix_max INTEGER,
    prix_min INTEGER,
    nombre_chambres INTEGER,
    has_eau BOOLEAN,
    has_electricite BOOLEAN,
    est_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    derniere_notif TIMESTAMPTZ
);
-- RLS
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gestion propres alertes" ON alertes FOR ALL USING (auth.uid() = id_utilisateur) WITH CHECK (auth.uid() = id_utilisateur);
-- Table pour historique des notifications envoyées
-- (éviter les doublons)
CREATE TABLE alertes_historique (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_alerte UUID NOT NULL REFERENCES alertes(id_alerte) ON DELETE CASCADE,
    id_propriete UUID NOT NULL REFERENCES proprietes(id_propriete) ON DELETE CASCADE,
    date_envoi TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(id_alerte, id_propriete)
);
ALTER TABLE alertes_historique ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture propre historique" ON alertes_historique FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM alertes a
            WHERE a.id_alerte = alertes_historique.id_alerte
                AND a.id_utilisateur = auth.uid()
        )
    );
-- Limit per user check
CREATE OR REPLACE FUNCTION check_alerte_limit() RETURNS TRIGGER AS $$ BEGIN IF (
        SELECT COUNT(*)
        FROM alertes
        WHERE id_utilisateur = NEW.id_utilisateur
    ) >= 5 THEN RAISE EXCEPTION 'Limite de 5 alertes atteinte par utilisateur';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_check_alerte_limit BEFORE
INSERT ON alertes FOR EACH ROW EXECUTE FUNCTION check_alerte_limit();