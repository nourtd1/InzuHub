ALTER TABLE utilisateurs
ADD COLUMN IF NOT EXISTS est_admin BOOLEAN DEFAULT FALSE;
-- L'admin peut tout lire
CREATE POLICY "Admin lecture totale" ON utilisateurs FOR
SELECT USING (
        auth.uid() = id_utilisateur 
        OR est_admin = TRUE
    );
-- L'admin peut mettre à jour le statut KYC
CREATE POLICY "Admin update kyc" ON kyc_demandes FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM utilisateurs
            WHERE id_utilisateur = auth.uid()
            AND est_admin = TRUE
        )
    );
-- L'admin peut supprimer des annonces
CREATE POLICY "Admin delete proprietes" ON proprietes FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM utilisateurs
        WHERE id_utilisateur = auth.uid()
        AND est_admin = TRUE
    )
);
-- Vue admin pour les stats globales
CREATE OR REPLACE VIEW admin_stats AS
SELECT (
        SELECT COUNT(*)
        FROM utilisateurs
    )::INTEGER AS total_utilisateurs,
    (
        SELECT COUNT(*)
        FROM utilisateurs
        WHERE role = 'proprietaire'
    )::INTEGER AS total_proprietaires,
    (
        SELECT COUNT(*)
        FROM utilisateurs
        WHERE role = 'locataire'
    )::INTEGER AS total_locataires,
    (
        SELECT COUNT(*)
        FROM utilisateurs
        WHERE statut_verification = 'approuve'
    )::INTEGER AS utilisateurs_verifies,
    (
        SELECT COUNT(*)
        FROM proprietes
    )::INTEGER AS total_proprietes,
    (
        SELECT COUNT(*)
        FROM proprietes
        WHERE statut = 'disponible'
    )::INTEGER AS proprietes_disponibles,
    (
        SELECT COUNT(*)
        FROM kyc_demandes
        WHERE statut = 'en_attente'
    )::INTEGER AS kyc_en_attente,
    (
        SELECT COUNT(*)
        FROM kyc_demandes
        WHERE statut = 'en_cours_review'
    )::INTEGER AS kyc_en_review,
    (
        SELECT COUNT(*)
        FROM signalements
        WHERE etat_traitement = 'en_attente'
    )::INTEGER AS signalements_en_attente,
    (
        SELECT COUNT(*)
        FROM conversations
    )::INTEGER AS total_conversations,
    (
        SELECT COUNT(*)
        FROM visites
        WHERE statut = 'confirmee'
    )::INTEGER AS visites_confirmees;