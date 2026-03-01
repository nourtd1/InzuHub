-- Table pour gérer les favoris des utilisateurs
CREATE TABLE public.favoris (
    id_favori UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_utilisateur UUID NOT NULL REFERENCES public.utilisateurs(id_utilisateur) ON DELETE CASCADE,
    id_propriete UUID NOT NULL REFERENCES public.proprietes(id_propriete) ON DELETE CASCADE,
    date_ajout TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
-- Index pour optimiser les requêtes
CREATE INDEX idx_favoris_utilisateur ON public.favoris(id_utilisateur);
CREATE INDEX idx_favoris_propriete ON public.favoris(id_propriete);
-- Contrainte unique pour empêcher un utilisateur de mettre une propriété en favori plusieurs fois
ALTER TABLE public.favoris
ADD CONSTRAINT favoris_utilisateur_propriete_unique UNIQUE (id_utilisateur, id_propriete);
-- Autoriser la table aux clients en activant la RLS (Row Level Security)
ALTER TABLE public.favoris ENABLE ROW LEVEL SECURITY;
-- Politiques RLS (Row Level Security)
-- Un utilisateur peut voir ses propres favoris
CREATE POLICY "Les utilisateurs peuvent voir leurs propres favoris" ON public.favoris FOR
SELECT USING (auth.uid() = id_utilisateur);
-- Un utilisateur peut ajouter un favori pour lui-même
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres favoris" ON public.favoris FOR
INSERT WITH CHECK (auth.uid() = id_utilisateur);
-- Un utilisateur peut supprimer ses propres favoris
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres favoris" ON public.favoris FOR DELETE USING (auth.uid() = id_utilisateur);