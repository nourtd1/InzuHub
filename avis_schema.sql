-- 1. Mise à jour du schéma Supabase
CREATE TABLE public.avis (
    id_avis UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_auteur UUID NOT NULL REFERENCES public.utilisateurs(id_utilisateur) ON DELETE CASCADE,
    id_proprietaire UUID NOT NULL REFERENCES public.utilisateurs(id_utilisateur) ON DELETE CASCADE,
    id_visite UUID NOT NULL REFERENCES public.visites(id_visite) ON DELETE CASCADE,
    id_propriete UUID NOT NULL REFERENCES public.proprietes(id_propriete) ON DELETE CASCADE,
    note INTEGER NOT NULL CHECK (
        note BETWEEN 1 AND 5
    ),
    commentaire TEXT,
    date_avis TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Un seul avis par visite
    UNIQUE(id_auteur, id_visite)
);
-- RLS
ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique avis" ON public.avis FOR
SELECT USING (true);
CREATE POLICY "Creation avis par auteur" ON public.avis FOR
INSERT WITH CHECK (auth.uid() = id_auteur);
CREATE POLICY "Suppression propre avis" ON public.avis FOR DELETE USING (auth.uid() = id_auteur);
-- Vue calculée pour les stats de notation
CREATE OR REPLACE VIEW public.stats_proprietaires AS
SELECT id_proprietaire,
    COUNT(*)::INTEGER AS total_avis,
    ROUND(AVG(note), 1) AS note_moyenne,
    COUNT(*) FILTER (
        WHERE note = 5
    )::INTEGER AS cinq_etoiles,
    COUNT(*) FILTER (
        WHERE note = 4
    )::INTEGER AS quatre_etoiles,
    COUNT(*) FILTER (
        WHERE note = 3
    )::INTEGER AS trois_etoiles,
    COUNT(*) FILTER (
        WHERE note = 2
    )::INTEGER AS deux_etoiles,
    COUNT(*) FILTER (
        WHERE note = 1
    )::INTEGER AS une_etoile
FROM public.avis
GROUP BY id_proprietaire;
-- Permettre la lecture sur la vue
GRANT SELECT ON public.stats_proprietaires TO anon,
    authenticated;