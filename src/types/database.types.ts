
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            quartiers: {
                Row: {
                    id_quartier: string
                    nom_quartier: string
                }
                Insert: {
                    id_quartier?: string
                    nom_quartier: string
                }
                Update: {
                    id_quartier?: string
                    nom_quartier?: string
                }
                Relationships: []
            }
            utilisateurs: {
                Row: {
                    id_utilisateur: string
                    nom_complet: string
                    numero_telephone: string
                    role: 'locataire' | 'proprietaire' | 'administrateur'
                    statut_verification: boolean
                    avatar_url: string | null
                    date_inscription: string
                    push_token: string | null
                }
                Insert: {
                    id_utilisateur: string
                    nom_complet: string
                    numero_telephone: string
                    role?: 'locataire' | 'proprietaire' | 'administrateur'
                    statut_verification?: boolean
                    avatar_url?: string | null
                    date_inscription?: string
                    push_token?: string | null
                }
                Update: {
                    id_utilisateur?: string
                    nom_complet?: string
                    numero_telephone?: string
                    role?: 'locataire' | 'proprietaire' | 'administrateur'
                    statut_verification?: boolean
                    avatar_url?: string | null
                    date_inscription?: string
                    push_token?: string | null
                }
                Relationships: []
            }
            proprietes: {
                Row: {
                    id_propriete: string
                    id_utilisateur: string
                    id_quartier: string
                    titre: string
                    description: string
                    prix_mensuel: number
                    garantie_exigee: number
                    nombre_chambres: number
                    nombre_salons: number
                    has_eau: boolean
                    has_electricite: boolean
                    has_cloture: boolean
                    has_parking: boolean
                    statut: 'disponible' | 'en_cours' | 'loue'
                    latitude: number | null
                    longitude: number | null
                    date_publication: string
                }
                Insert: {
                    id_propriete?: string
                    id_utilisateur: string
                    id_quartier: string
                    titre: string
                    description: string
                    prix_mensuel: number
                    garantie_exigee?: number
                    nombre_chambres: number
                    nombre_salons?: number
                    has_eau?: boolean
                    has_electricite?: boolean
                    has_cloture?: boolean
                    has_parking?: boolean
                    statut?: 'disponible' | 'en_cours' | 'loue'
                    latitude?: number | null
                    longitude?: number | null
                    date_publication?: string
                }
                Update: {
                    id_propriete?: string
                    id_utilisateur?: string
                    id_quartier?: string
                    titre?: string
                    description?: string
                    prix_mensuel?: number
                    garantie_exigee?: number
                    nombre_chambres?: number
                    nombre_salons?: number
                    has_eau?: boolean
                    has_electricite?: boolean
                    has_cloture?: boolean
                    has_parking?: boolean
                    statut?: 'disponible' | 'en_cours' | 'loue'
                    latitude?: number | null
                    longitude?: number | null
                    date_publication?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "proprietes_id_quartier_fkey"
                        columns: ["id_quartier"]
                        isOneToOne: false
                        referencedRelation: "quartiers"
                        referencedColumns: ["id_quartier"]
                    },
                    {
                        foreignKeyName: "proprietes_id_utilisateur_fkey"
                        columns: ["id_utilisateur"]
                        isOneToOne: false
                        referencedRelation: "utilisateurs"
                        referencedColumns: ["id_utilisateur"]
                    }
                ]
            }
            photos: {
                Row: {
                    id_photo: string
                    id_propriete: string
                    url_photo: string
                    est_photo_principale: boolean
                }
                Insert: {
                    id_photo?: string
                    id_propriete: string
                    url_photo: string
                    est_photo_principale?: boolean
                }
                Update: {
                    id_photo?: string
                    id_propriete?: string
                    url_photo?: string
                    est_photo_principale?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: "photos_id_propriete_fkey"
                        columns: ["id_propriete"]
                        isOneToOne: false
                        referencedRelation: "proprietes"
                        referencedColumns: ["id_propriete"]
                    }
                ]
            }
            conversations: {
                Row: {
                    id_conversation: string
                    id_locataire: string
                    id_proprietaire: string
                    id_propriete: string
                    date_creation: string
                    derniere_activite: string
                }
                Insert: {
                    id_conversation?: string
                    id_locataire: string
                    id_proprietaire: string
                    id_propriete: string
                    date_creation?: string
                    derniere_activite?: string
                }
                Update: {
                    id_conversation?: string
                    id_locataire?: string
                    id_proprietaire?: string
                    id_propriete?: string
                    date_creation?: string
                    derniere_activite?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "conversations_id_locataire_fkey"
                        columns: ["id_locataire"]
                        isOneToOne: false
                        referencedRelation: "utilisateurs"
                        referencedColumns: ["id_utilisateur"]
                    },
                    {
                        foreignKeyName: "conversations_id_proprietaire_fkey"
                        columns: ["id_proprietaire"]
                        isOneToOne: false
                        referencedRelation: "utilisateurs"
                        referencedColumns: ["id_utilisateur"]
                    },
                    {
                        foreignKeyName: "conversations_id_propriete_fkey"
                        columns: ["id_propriete"]
                        isOneToOne: false
                        referencedRelation: "proprietes"
                        referencedColumns: ["id_propriete"]
                    }
                ]
            }
            messages: {
                Row: {
                    id_message: string
                    id_conversation: string
                    id_expediteur: string
                    contenu: string
                    type: 'texte' | 'visite_proposee' | 'visite_confirmee'
                    date_envoi: string
                    lu: boolean
                }
                Insert: {
                    id_message?: string
                    id_conversation: string
                    id_expediteur: string
                    contenu: string
                    type?: 'texte' | 'visite_proposee' | 'visite_confirmee'
                    date_envoi?: string
                    lu?: boolean
                }
                Update: {
                    id_message?: string
                    id_conversation?: string
                    id_expediteur?: string
                    contenu?: string
                    type?: 'texte' | 'visite_proposee' | 'visite_confirmee'
                    date_envoi?: string
                    lu?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_id_conversation_fkey"
                        columns: ["id_conversation"]
                        isOneToOne: false
                        referencedRelation: "conversations"
                        referencedColumns: ["id_conversation"]
                    },
                    {
                        foreignKeyName: "messages_id_expediteur_fkey"
                        columns: ["id_expediteur"]
                        isOneToOne: false
                        referencedRelation: "utilisateurs"
                        referencedColumns: ["id_utilisateur"]
                    }
                ]
            }
            visites: {
                Row: {
                    id_visite: string
                    id_conversation: string
                    date_visite: string
                    statut: 'proposee' | 'confirmee' | 'annulee'
                    date_creation: string
                }
                Insert: {
                    id_visite?: string
                    id_conversation: string
                    date_visite: string
                    statut?: 'proposee' | 'confirmee' | 'annulee'
                    date_creation?: string
                }
                Update: {
                    id_visite?: string
                    id_conversation?: string
                    date_visite?: string
                    statut?: 'proposee' | 'confirmee' | 'annulee'
                    date_creation?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "visites_id_conversation_fkey"
                        columns: ["id_conversation"]
                        isOneToOne: false
                        referencedRelation: "conversations"
                        referencedColumns: ["id_conversation"]
                    }
                ]
            }
            signalements: {
                Row: {
                    id_signalement: string
                    id_utilisateur: string
                    id_propriete: string
                    motif: string
                    date_signalement: string
                    etat_traitement: 'en_attente' | 'resolu' | 'rejete'
                }
                Insert: {
                    id_signalement?: string
                    id_utilisateur: string
                    id_propriete: string
                    motif: string
                    date_signalement?: string
                    etat_traitement?: 'en_attente' | 'resolu' | 'rejete'
                }
                Update: {
                    id_signalement?: string
                    id_utilisateur?: string
                    id_propriete?: string
                    motif?: string
                    date_signalement?: string
                    etat_traitement?: 'en_attente' | 'resolu' | 'rejete'
                }
                Relationships: [
                    {
                        foreignKeyName: "signalements_id_propriete_fkey"
                        columns: ["id_propriete"]
                        isOneToOne: false
                        referencedRelation: "proprietes"
                        referencedColumns: ["id_propriete"]
                    },
                    {
                        foreignKeyName: "signalements_id_utilisateur_fkey"
                        columns: ["id_utilisateur"]
                        isOneToOne: false
                        referencedRelation: "utilisateurs"
                        referencedColumns: ["id_utilisateur"]
                    }
                ]
            }
            notification_tokens: {
                Row: {
                    id: string
                    id_utilisateur: string
                    token: string
                    platform: 'ios' | 'android' | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    id_utilisateur: string
                    token: string
                    platform?: 'ios' | 'android' | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    id_utilisateur?: string
                    token?: string
                    platform?: 'ios' | 'android' | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "notification_tokens_id_utilisateur_fkey"
                        columns: ["id_utilisateur"]
                        isOneToOne: true
                        referencedRelation: "utilisateurs"
                        referencedColumns: ["id_utilisateur"]
                    }
                ]
            }
            kyc_demandes: {
                Row: {
                    id_demande: string
                    id_utilisateur: string
                    url_recto: string
                    url_verso: string
                    url_selfie: string
                    statut: 'en_attente' | 'en_cours_review' | 'approuve' | 'rejete'
                    motif_rejet: string | null
                    date_soumission: string
                    date_traitement: string | null
                }
                Insert: {
                    id_demande?: string
                    id_utilisateur: string
                    url_recto: string
                    url_verso: string
                    url_selfie: string
                    statut?: 'en_attente' | 'en_cours_review' | 'approuve' | 'rejete'
                    motif_rejet?: string | null
                    date_soumission?: string
                    date_traitement?: string | null
                }
                Update: {
                    id_demande?: string
                    id_utilisateur?: string
                    url_recto?: string
                    url_verso?: string
                    url_selfie?: string
                    statut?: 'en_attente' | 'en_cours_review' | 'approuve' | 'rejete'
                    motif_rejet?: string | null
                    date_soumission?: string
                    date_traitement?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "kyc_demandes_id_utilisateur_fkey"
                        columns: ["id_utilisateur"]
                        isOneToOne: true
                        referencedRelation: "utilisateurs"
                        referencedColumns: ["id_utilisateur"]
                    }
                ]
            }
            favoris: {
                Row: {
                    id_favori: string
                    id_utilisateur: string
                    id_propriete: string
                    date_ajout: string
                }
                Insert: {
                    id_favori?: string
                    id_utilisateur: string
                    id_propriete: string
                    date_ajout?: string
                }
                Update: {
                    id_favori?: string
                    id_utilisateur?: string
                    id_propriete?: string
                    date_ajout?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "favoris_id_utilisateur_fkey"
                        columns: ["id_utilisateur"]
                        isOneToOne: false
                        referencedRelation: "utilisateurs"
                        referencedColumns: ["id_utilisateur"]
                    },
                    {
                        foreignKeyName: "favoris_id_propriete_fkey"
                        columns: ["id_propriete"]
                        isOneToOne: false
                        referencedRelation: "proprietes"
                        referencedColumns: ["id_propriete"]
                    }
                ]
            }
            avis: {
                Row: {
                    id_avis: string
                    id_auteur: string
                    id_proprietaire: string
                    id_visite: string
                    id_propriete: string
                    note: 1 | 2 | 3 | 4 | 5
                    commentaire: string | null
                    date_avis: string
                }
                Insert: {
                    id_avis?: string
                    id_auteur: string
                    id_proprietaire: string
                    id_visite: string
                    id_propriete: string
                    note: 1 | 2 | 3 | 4 | 5
                    commentaire?: string | null
                    date_avis?: string
                }
                Update: {
                    id_avis?: string
                    id_auteur?: string
                    id_proprietaire?: string
                    id_visite?: string
                    id_propriete?: string
                    note?: 1 | 2 | 3 | 4 | 5
                    commentaire?: string | null
                    date_avis?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "avis_id_auteur_fkey"
                        columns: ["id_auteur"]
                        isOneToOne: false
                        referencedRelation: "utilisateurs"
                        referencedColumns: ["id_utilisateur"]
                    },
                    {
                        foreignKeyName: "avis_id_proprietaire_fkey"
                        columns: ["id_proprietaire"]
                        isOneToOne: false
                        referencedRelation: "utilisateurs"
                        referencedColumns: ["id_utilisateur"]
                    },
                    {
                        foreignKeyName: "avis_id_visite_fkey"
                        columns: ["id_visite"]
                        isOneToOne: true
                        referencedRelation: "visites"
                        referencedColumns: ["id_visite"]
                    },
                    {
                        foreignKeyName: "avis_id_propriete_fkey"
                        columns: ["id_propriete"]
                        isOneToOne: false
                        referencedRelation: "proprietes"
                        referencedColumns: ["id_propriete"]
                    }
                ]
            }
        }
        Views: {
            stats_proprietaires: {
                Row: {
                    id_proprietaire: string
                    total_avis: number
                    note_moyenne: number
                    cinq_etoiles: number
                    quatre_etoiles: number
                    trois_etoiles: number
                    deux_etoiles: number
                    une_etoile: number
                }
            }
        }
    }
}

// Shortcut types
export type Utilisateur = Database['public']['Tables']['utilisateurs']['Row']
export type Propriete = Database['public']['Tables']['proprietes']['Row']
export type Quartier = Database['public']['Tables']['quartiers']['Row']
export type Photo = Database['public']['Tables']['photos']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Visite = Database['public']['Tables']['visites']['Row']
export type Signalement = Database['public']['Tables']['signalements']['Row']

// Utility types
export type ProprieteAvecPhotos = Propriete & { photos: Photo[] }
export type ProprieteComplete = Propriete & {
    photos: Photo[]
    quartier: Quartier
    proprietaire: Pick<Utilisateur, 'nom_complet' | 'numero_telephone' | 'statut_verification' | 'avatar_url' | 'date_inscription'>
}
export type ConversationAvecDetails = Conversation & {
    propriete: Pick<Propriete, 'titre' | 'prix_mensuel' | 'id_propriete' | 'id_utilisateur'> & {
        quartier?: Pick<Quartier, 'nom_quartier'> | null
    }
    locataire: Pick<Utilisateur, 'nom_complet' | 'avatar_url' | 'id_utilisateur' | 'numero_telephone'>
    proprietaire: Pick<Utilisateur, 'nom_complet' | 'avatar_url' | 'id_utilisateur' | 'numero_telephone'>
    dernier_message?: Pick<Message, 'contenu' | 'date_envoi' | 'lu'>
}

export type VisiteComplete = Visite & {
    conversation: Conversation & {
        propriete: ProprieteComplete
        locataire: Pick<Utilisateur, 'id_utilisateur' | 'nom_complet' | 'numero_telephone' | 'avatar_url'>
        proprietaire: Pick<Utilisateur, 'id_utilisateur' | 'nom_complet' | 'numero_telephone' | 'avatar_url' | 'statut_verification'>
    }
}

export type KycDemande = Database['public']['Tables']['kyc_demandes']['Row']

export interface Favori {
    id_favori: string
    id_utilisateur: string
    id_propriete: string
    date_ajout: string
}

export type FavoriAvecPropriete = Favori & {
    propriete: ProprieteAvecPhotos & {
        quartier: Quartier
        proprietaire: Pick<Utilisateur, 'nom_complet' | 'statut_verification'>
    }
}

export type Avis = Database['public']['Tables']['avis']['Row']
export type StatsProprietaire = Database['public']['Views']['stats_proprietaires']['Row']

export type AvisComplet = Avis & {
    auteur: Pick<Utilisateur, 'id_utilisateur' | 'nom_complet' | 'avatar_url'>
    propriete: Pick<Propriete, 'titre'>
}

export interface Alerte {
    id_alerte: string
    id_utilisateur: string
    nom_alerte: string
    id_quartier: string | null
    prix_max: number | null
    prix_min: number | null
    nombre_chambres: number | null
    has_eau: boolean | null
    has_electricite: boolean | null
    est_active: boolean
    date_creation: string
    derniere_notif: string | null
}

export type AlerteAvecQuartier = Alerte & {
    quartier: Quartier | null
}

