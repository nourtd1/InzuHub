# 🏠 InzuHub

> **La première plateforme digitale de location immobilière de Gisenyi, Rwanda.**
> Trouvez ou publiez votre logement sans commissionnaire — directement, simplement, en toute confiance.

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_54-blue?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Backend-Supabase-green?logo=supabase)
![Langues](https://img.shields.io/badge/Langues-FR_|_EN_|_RW_|_SW-orange)
![Plateforme](https://img.shields.io/badge/Plateforme-iOS_|_Android-lightgrey)

</div>

---

## 📋 Table des Matières

- [À propos du projet](#-à-propos-du-projet)
- [Le problème résolu](#-le-problème-résolu)
- [Fonctionnalités complètes](#-fonctionnalités-complètes)
- [Stack technique](#-stack-technique)
- [Architecture du projet](#-architecture-du-projet)
- [Prérequis](#-prérequis)
- [Installation pas à pas](#-installation-pas-à-pas)
- [Configuration Supabase](#-configuration-supabase)
- [Variables d'environnement](#-variables-denvironnement)
- [Lancer le projet](#-lancer-le-projet)
- [Résolution des erreurs courantes](#-résolution-des-erreurs-courantes)
- [Structure des écrans et parcours utilisateur](#-structure-des-écrans-et-parcours-utilisateur)
- [Schéma de base de données](#-schéma-de-base-de-données)
- [Sécurité & RLS](#-sécurité--rls)
- [Multi-langue](#-multi-langue)
- [Dashboard Admin](#-dashboard-admin)
- [Points d'intérêt de Gisenyi](#-points-dintérêt-de-gisenyi)
- [Roadmap](#-roadmap)
- [Contribuer](#-contribuer)
- [Support](#-support)
- [Licence](#-licence)

---

## 🌍 À propos du projet

**InzuHub** est une application mobile complète développée avec **React Native** et **Expo**, spécifiquement conçue pour digitaliser le marché locatif de la ville de **Gisenyi** (District de Rubavu), à l'ouest du Rwanda, au bord du **Lac Kivu**.

### Pourquoi Gisenyi ?

Gisenyi est une ville en pleine croissance, carrefour commercial entre le Rwanda et la RDC (frontière de Goma). Malgré cette activité économique, son marché locatif reste 100% informel : pas de plateforme numérique, tout passe par des commissionnaires qui s'imposent comme intermédiaires obligatoires entre propriétaires et locataires.

### Ce que fait InzuHub

L'application met en relation **directe** les locataires et les propriétaires, en éliminant totalement la dépendance aux commissionnaires. Les propriétaires publient leurs annonces avec photos, prix et localisation. Les locataires cherchent, filtrent, contactent directement et planifient leurs visites — le tout depuis leur téléphone.

### Ce projet comprend deux parties

| Partie | Description | Technologie |
|--------|-------------|-------------|
| 📱 **App Mobile** | Application pour locataires et propriétaires | React Native + Expo |
| 🖥️ **Dashboard Admin** | Interface web pour l'équipe InzuHub (gestion KYC, modération) | React + Vite + Tailwind |

---

## 🔍 Le problème résolu

À Gisenyi, rechercher un logement est un processus long, coûteux et risqué. Voici les 6 problèmes identifiés et les solutions apportées par InzuHub :

| # | Problème identifié | Impact réel | Solution InzuHub |
|---|-------------------|-------------|-----------------|
| 1 | **Commissionnaires obligatoires** — ils s'imposent entre propriétaires et locataires | Frais supplémentaires de 1 à 2 mois de loyer | Contact direct propriétaire ↔ locataire via InzuChat |
| 2 | **Perte de temps considérable** — visites inutiles pour des logements déjà loués | Plusieurs jours perdus pour trouver un logement | Minimum 3 photos obligatoires + infos complètes avant de contacter |
| 3 | **Manque total de transparence** — prix négociés à l'oral, détails flous | Locataires floués sur le prix réel | Fiche technique complète : prix, garantie, eau, électricité, équipements |
| 4 | **Aucun accès direct aux propriétaires** — tout passe par des intermédiaires | Informations déformées, délais de réponse longs | InzuChat : messagerie temps réel directe sans intermédiaire |
| 5 | **Marché 100% non digitalisé** — bouche-à-oreille et affiches papier uniquement | Offres limitées, pas de comparaison possible | Plateforme centralisée : toutes les annonces de Gisenyi en un endroit |
| 6 | **Arnaques fréquentes** — fausses annonces, propriétaires fantômes | Perte d'argent, insécurité pour les locataires | Système KYC (vérification Indangamuntu) + signalements communautaires |

---

## ✨ Fonctionnalités complètes

### 🏠 Pour les Locataires

| Fonctionnalité | Description détaillée |
|---|---|
| 🔍 **Exploration Immobilière** | Liste de toutes les annonces disponibles. Filtres par quartier (10 quartiers de Gisenyi), fourchette de prix en RWF, nombre de chambres minimum, équipements requis (eau, électricité, clôture, parking). Recherche textuelle avec debounce 400ms. Pull-to-refresh. |
| 🗺️ **Carte des Logements** | Vue cartographique centrée sur Gisenyi (Lac Kivu). Marqueurs de prix colorés selon le statut (vert=disponible, orange=en discussion, rouge=loué). 7 points d'intérêt réels de la ville. Tap sur un marqueur → panneau de prévisualisation qui monte depuis le bas avec animation spring. |
| 🏠 **Fiche Détaillée** | Galerie photos immersive (swipe horizontal + plein écran au tap). Prix mensuel + garantie + calcul automatique du total à l'entrée. Grille des caractéristiques techniques. Description avec "Lire plus/moins". Mini-carte de localisation avec bouton itinéraire Google Maps. Profil du propriétaire avec badge de vérification. Section avis avec note moyenne et répartition. |
| 💬 **InzuChat** | Messagerie temps réel powered by Supabase Realtime. Indicateur "est en train d'écrire..." via Supabase Presence. Optimistic updates (message affiché localement avant confirmation serveur). Indicateurs de lecture ✓ (envoyé) ✓✓ (lu). Historique paginé. Message de bienvenue automatique à la première conversation. |
| 📅 **Planification de Visite** | Calendrier horizontal 30 jours glissants (dimanches grisés). Grille de créneaux horaires 08h-18h par pas de 30 minutes. Vérification de disponibilité en temps réel. Proposition envoyée directement dans le chat. Carte de visite dans le chat avec boutons Confirmer/Refuser pour le propriétaire. |
| ❤️ **Favoris** | Sauvegarde d'annonces avec animation bounce au tap. Optimistic update immédiat (cœur rouge instantané avant confirmation serveur). Rollback automatique si erreur réseau. Alerte push automatique si une annonce favorite change de statut (louée ou de nouveau disponible). Écran "Mes Favoris" avec swipe gauche pour retirer. |
| 🔔 **Alertes Personnalisées** | Création d'alertes par critères (quartier, prix min/max, nombre de chambres, eau obligatoire, électricité obligatoire). Maximum 5 alertes actives par utilisateur. Notification push instantanée quand une nouvelle annonce correspond (Edge Function Supabase). Toggle on/off sans supprimer l'alerte. Aperçu des critères en temps réel pendant la saisie. |
| ⭐ **Notes & Avis** | Notation des propriétaires après une visite confirmée et passée (1 à 5 étoiles + label contextuel : "😞 Très décevant" à "🤩 Excellent !"). Commentaire optionnel (max 300 caractères). Affichage de la moyenne et de la répartition (barres proportionnelles) sur les fiches propriétaires. Un seul avis par visite. Possibilité de supprimer son propre avis. |

### 📸 Pour les Propriétaires

| Fonctionnalité | Description détaillée |
|---|---|
| 📸 **Dépôt d'Annonce — Étape 1** | Grille de photos 3 colonnes. Upload depuis caméra ou galerie. Indicateur de progression individuel par photo (%). Photo principale marquée d'une bordure bleue + étoile ★. Définition du prix mensuel en RWF avec aperçu formaté. Sélection de la garantie en mois (pills cliquables : 0/1/2/3/6/12). Récapitulatif financier automatique (loyer + garantie = total à l'entrée). Sauvegarde de brouillon automatique dans AsyncStorage. |
| 📍 **Dépôt d'Annonce — Étape 2** | Titre (10-100 caractères) et description (30-1000 caractères) avec suggestions rapides cliquables ("+Eau 24h/24", "+Électricité RECO", "+Vue sur le lac"...). QuartierPicker (BottomSheet avec recherche). Placement précis sur la carte via MapPickerModal (tap ou drag du marqueur). Sélecteur +/- pour chambres (1-20) et salons (0-10). 4 toggles équipements (eau, électricité, clôture, parking). Aperçu de l'annonce (PropertyCard) avant publication. Rollback automatique (suppression propriété) si l'upload des photos échoue. |
| 📊 **Gestion des Annonces** | Changement de statut directement depuis le profil (Disponible / En discussion / Loué). Menu ⋮ par annonce pour modifier ou supprimer. Stats dans la grille du profil : nombre d'annonces actives, louées, conversations reçues. |

### 🔐 Pour tous les utilisateurs

| Fonctionnalité | Description détaillée |
|---|---|
| 📱 **Authentification** | Inscription et connexion par numéro de téléphone rwandais (+2507XXXXXXXX). Conversion automatique en email fictif @inzuhub.rw. Validation du format rwandais. Indicateur de force du mot de passe. Session persistante via expo-secure-store. Protection automatique des routes selon l'état de connexion (redirect login/app). |
| 🪪 **Vérification KYC** | Wizard guidé en 6 étapes (intro → recto → verso → selfie → review → confirmation). Cadre pointillé ratio 85.6:54 (format réel d'une carte d'identité). Compression et resize automatique avant upload. Upload sécurisé dans un bucket privé Supabase (kyc-documents). Suivi du statut en temps réel via Supabase Realtime. Notification push automatique à l'approbation ou au rejet avec motif. |
| ✅ **Badge de Confiance** | Badge "✓ Identité Vérifiée par InzuHub" visible sur toutes les annonces, dans le profil et sur les messages chat. Donne une confiance immédiate aux locataires et propriétaires. |
| 🚩 **Signalement** | 6 motifs prédéfinis (fausse annonce, prix différent, demande d'argent avant visite, logement déjà loué, coordonnées incorrectes, autre). Champ libre pour "Autre". Un seul signalement par utilisateur par annonce (contrainte UNIQUE). Traité par l'équipe InzuHub via le dashboard admin. |
| 🔔 **Notifications Push** | Rappels automatiques 24h et 2h avant chaque visite confirmée (+ à l'heure exacte). Alerte KYC approuvé/rejeté. Alerte statut favori changé (loué ou de nouveau disponible). Alerte nouvelle annonce correspondant à une alerte personnalisée. Badge sur l'icône de l'app remis à 0 à l'ouverture. |
| 🌍 **Multi-langue** | 4 langues : Français 🇫🇷, English 🇬🇧, Kinyarwanda 🇷🇼, Kiswahili 🌍. Détection automatique de la langue du téléphone au premier lancement. Persistance du choix dans AsyncStorage. Changement instantané de toute l'interface sans redémarrage. Fallback automatique vers le français si une clé manque. |

---

## 🛠️ Stack technique

### Application Mobile (InzuHub/)

| Catégorie | Technologie | Version | Rôle précis |
|-----------|-------------|---------|-------------|
| Framework | React Native + Expo | SDK 54 | Base de l'application mobile cross-platform |
| Langage | TypeScript | 5.x | Typage strict sur l'ensemble du projet |
| Navigation | Expo Router | ~6.0 | Routing file-based (similaire à Next.js) |
| Backend | Supabase | Latest | Base de données + Auth + Storage + Realtime + Edge Functions |
| Base de données | PostgreSQL | 15 | Via Supabase, avec RLS activé sur toutes les tables |
| Temps réel | Supabase Realtime | — | Chat, indicateur frappe, notifications KYC, statut favoris |
| Stockage fichiers | Supabase Storage | — | Photos annonces (public), avatars (public), KYC (privé) |
| State global | Zustand | Latest | Store Zustand pour le formulaire de dépôt d'annonce |
| State Auth | React Context | — | Session utilisateur et profil accessibles partout |
| Carte | react-native-maps | Latest | Carte interactive centrée sur Gisenyi |
| Listes | @shopify/flash-list | Latest | Listes haute performance (remplace FlatList) |
| Dates | date-fns | Latest | Formatage dates/heures en français et autres langues |
| Sessions | expo-secure-store | Latest | Stockage sécurisé et chiffré des tokens Supabase |
| Notifications | expo-notifications | Latest | Notifications push + scheduling rappels visites |
| Images | expo-image-manipulator | Latest | Compression et resize avant upload (qualité 0.85, max 1200px) |
| Caméra | expo-image-picker | Latest | Accès galerie et appareil photo avec permissions |
| Géolocalisation | expo-location | Latest | Position de l'utilisateur sur la carte |
| i18n | i18next + react-i18next | Latest | Système de traduction complet avec interpolation et pluriels |
| Détection langue | expo-localization | Latest | Détecte la langue configurée sur le téléphone |

### Dashboard Admin (inzuhub-admin/)

| Catégorie | Technologie | Version | Rôle précis |
|-----------|-------------|---------|-------------|
| Framework | React | 18 | Interface web d'administration |
| Bundler | Vite | Latest | Build ultra-rapide en développement |
| Styling | Tailwind CSS | 3.x | Design system utilitaire, desktop-first |
| Backend | Supabase (même projet) | Latest | Accès aux mêmes données que l'app mobile |
| Routing | react-router-dom | 6.x | Navigation entre les pages du dashboard |
| Data fetching | @tanstack/react-query | 5.x | Cache, synchronisation et invalidation des requêtes |
| Graphiques | recharts | Latest | LineChart inscriptions + BarChart annonces par quartier |
| Dates | date-fns | Latest | Formatage des dates dans les tableaux |

---

## 🗂️ Architecture du projet

### Application Mobile

```
InzuHub/
│
├── app/                                    # Expo Router — routing file-based
│   │
│   ├── _layout.tsx                         # 🌐 Root layout
│   │                                       #    - Initialisation i18n (charge langue sauvegardée)
│   │                                       #    - Provider AuthContext (session globale)
│   │                                       #    - Provider FavorisContext (favoris globaux)
│   │                                       #    - Provider ToastContext (notifications in-app)
│   │                                       #    - Gestion notifications push (deep links)
│   │                                       #    - Redirect automatique login ↔ app selon session
│   │
│   ├── (auth)/                             # 🔒 Groupe routes NON authentifiées
│   │   ├── login.tsx                       #    Connexion : numéro téléphone + mot de passe
│   │   │                                   #    Bouton 🌍 langue en haut à droite
│   │   └── register.tsx                    #    Inscription : nom + téléphone + MDP + rôle
│   │                                       #    RoleSelector : Locataire / Propriétaire
│   │                                       #    PasswordStrengthIndicator (faible/moyen/fort)
│   │
│   ├── (app)/                              # ✅ Groupe routes AUTHENTIFIÉES
│   │   │
│   │   ├── (tabs)/                         # 📱 Navigation par onglets (barre en bas)
│   │   │   ├── _layout.tsx                 #    Tab bar avec badge rouge messages non lus
│   │   │   ├── index.tsx                   #    🏠 Accueil — Exploration Immobilière
│   │   │   │                               #       FlashList des annonces + recherche + filtres
│   │   │   │                               #       Chips quartiers + bannière alertes
│   │   │   ├── map.tsx                     #    🗺️ Carte — react-native-maps Gisenyi
│   │   │   │                               #       Marqueurs prix + POI + panel prévisualisation
│   │   │   ├── chat.tsx                    #    💬 InzuChat — Liste conversations Realtime
│   │   │   │                               #       Sections date + swipe supprimer
│   │   │   └── profile.tsx                 #    👤 Profil — stats + annonces/visites + menu
│   │   │
│   │   ├── property/[id].tsx               # 🏠 Fiche Détaillée logement
│   │   ├── chat/[id].tsx                   # 💬 Discussion Active (temps réel)
│   │   ├── visite/[id].tsx                 # 📅 Confirmation de Visite + countdown
│   │   ├── favorites.tsx                   # ❤️ Mes Favoris
│   │   ├── alertes.tsx                     # 🔔 Mes Alertes personnalisées
│   │   ├── owner-reviews/[id].tsx          # ⭐ Tous les Avis d'un propriétaire
│   │   └── post/                           # 📸 Dépôt Annonce (2 étapes)
│   │       ├── media.tsx                   #    Étape 1 : Photos + Prix + Garantie
│   │       ├── location.tsx                #    Étape 2 : Titre + Quartier + Carte + Équipements
│   │       └── success.tsx                 #    Succès (router.replace, pas de retour arrière)
│   │
│   └── kyc.tsx                             # 🪪 Vérification KYC (6 étapes)
│
├── src/
│   ├── components/
│   │   ├── ui/                             # 🧩 Composants réutilisables partout
│   │   │   ├── Button.tsx                  #    Variants : primary, secondary, outline, ghost, danger
│   │   │   ├── InputField.tsx              #    Input avec label, message erreur, rightElement
│   │   │   ├── Avatar.tsx                  #    Photo profil avec fallback initiales colorées
│   │   │   ├── EmptyState.tsx              #    Écran vide : icône + titre + sous-titre + CTA
│   │   │   ├── ProgressBar.tsx             #    Barre progression animée (0 à 1)
│   │   │   ├── QuartierChip.tsx            #    Chip quartier scrollable horizontalement
│   │   │   ├── ReadMoreText.tsx            #    Texte tronqué avec bouton "Lire plus/moins"
│   │   │   ├── StepperInput.tsx            #    Sélecteur +/- avec singulier/pluriel auto
│   │   │   ├── Toast.tsx                   #    Toast global slide-up (success/warning/error/info)
│   │   │   ├── StarRating.tsx              #    Étoiles interactives ou lecture seule (demi-étoiles)
│   │   │   ├── FavorisButton.tsx           #    Bouton ❤️ avec animation bounce
│   │   │   └── LanguageSelector.tsx        #    Sélecteur FR/EN/RW/SW avec drapeaux
│   │   │
│   │   ├── property/                       # 🏠 Composants liés aux annonces
│   │   │   ├── PropertyCard.tsx            #    Carte annonce avec FavorisButton en overlay
│   │   │   ├── PhotoGallery.tsx            #    Galerie immersive + ImageViewer plein écran
│   │   │   ├── FilterModal.tsx             #    Modal filtres avancés
│   │   │   ├── CaracteristiqueItem.tsx     #    Item avec icône (eau, électricité...)
│   │   │   ├── SignalementModal.tsx        #    Modal signalement avec motifs prédéfinis
│   │   │   └── AnnoncePreview.tsx          #    PropertyCard en mode aperçu (badge PREVIEW)
│   │   │
│   │   ├── chat/                           # 💬 Composants messagerie
│   │   │   ├── ConversationItem.tsx        #    Item liste : avatar + nom + dernier message + heure
│   │   │   ├── SwipeableConversationItem.tsx # Swipe gauche pour révéler bouton supprimer
│   │   │   ├── MessageBubble.tsx           #    Bulle : texte / visite_proposee / visite_confirmee
│   │   │   ├── ChatInputBar.tsx            #    Saisie message + bouton 📅 visite
│   │   │   ├── DateSeparator.tsx           #    Séparateur "Aujourd'hui", "Hier", dates
│   │   │   ├── TypingIndicator.tsx         #    3 points pulsants (Supabase Presence)
│   │   │   └── EmptyStateChat.tsx          #    État vide adapté au rôle locataire/propriétaire
│   │   │
│   │   ├── map/                            # 🗺️ Composants carte
│   │   │   ├── PropertyMarker.tsx          #    Bulle prix colorée (vert/orange/rouge + ★ si vérifié)
│   │   │   ├── POIMarker.tsx               #    Marqueur point d'intérêt avec icône
│   │   │   ├── PropertyPreviewPanel.tsx    #    Panel slide-up spring avec swipe down pour fermer
│   │   │   └── RecenterButton.tsx          #    Bouton 🎯 retour sur Gisenyi
│   │   │
│   │   ├── visite/                         # 📅 Composants planification visites
│   │   │   ├── VisiteWidget.tsx            #    Wizard 3 étapes date → heure → confirmation
│   │   │   ├── DayCard.tsx                 #    Carte jour avec animation scale au tap
│   │   │   ├── TimeSlot.tsx                #    Créneau : disponible / sélectionné / indisponible
│   │   │   └── StepIndicator.tsx           #    Indicateur progression étapes 1/2/3
│   │   │
│   │   ├── profile/                        # 👤 Composants profil utilisateur
│   │   │   ├── TrustBadge.tsx              #    ✅ Vérifié (secondary) ou ⚠️ Non vérifié (warning)
│   │   │   ├── StatsGrid.tsx               #    Grille 2x2 avec animation countUp + tap navigable
│   │   │   ├── MyPropertiesSection.tsx     #    Annonces propriétaire avec menu ⋮ (statut/suppr.)
│   │   │   ├── MyVisitsSection.tsx         #    Visites locataire (à venir/passées) + bouton avis
│   │   │   ├── EditProfileModal.tsx        #    Modifier nom + avatar (ImagePicker + compression)
│   │   │   └── ParametresModal.tsx         #    Notifications, langue, MDP, suppr. compte
│   │   │
│   │   ├── kyc/                            # 🪪 Composants vérification identité
│   │   │   ├── KycStepIndicator.tsx        #    Barre d'étapes 1 à 6 avec couleurs
│   │   │   ├── CaptureFrame.tsx            #    Cadre pointillé ratio carte d'identité 85.6:54
│   │   │   ├── CaptureOptions.tsx          #    Choix : appareil photo ou galerie
│   │   │   └── KycStatusScreen.tsx         #    Affichage statut avec icônes et instructions
│   │   │
│   │   ├── post/                           # 📸 Composants formulaire dépôt annonce
│   │   │   ├── PhotoGrid.tsx               #    Grille 3 colonnes + progress upload + drag & drop
│   │   │   ├── EquipementToggle.tsx        #    Card toggle équipement (tap sur toute la carte)
│   │   │   ├── QuartierPicker.tsx          #    BottomSheet avec recherche en temps réel
│   │   │   └── MapPickerModal.tsx          #    Modal plein écran : tap ou drag du marker
│   │   │
│   │   ├── avis/                           # ⭐ Composants notes et avis
│   │   │   ├── AvisCard.tsx                #    Carte : avatar + étoiles + date + commentaire + 🗑
│   │   │   └── AvisModal.tsx               #    BottomSheet notation : étoiles + label + commentaire
│   │   │
│   │   └── alertes/                        # 🔔 Composants alertes personnalisées
│   │       ├── AlerteCard.tsx              #    Carte alerte : critères + dernière notif + toggle
│   │       └── AlerteFormModal.tsx         #    Formulaire création/modification avec aperçu live
│   │
│   ├── hooks/                              # 🪝 Custom hooks React
│   │   ├── useAuth.ts                      #    Accès session + profil + signIn/Out/Up
│   │   ├── useProperties.ts                #    Liste + filtres + pagination + refresh
│   │   ├── usePropertyDetail.ts            #    Détails propriété par ID
│   │   ├── useMapProperties.ts             #    Annonces pour carte (coordonnées)
│   │   ├── useConversations.ts             #    Liste + Realtime + badge non lus
│   │   ├── useChat.ts                      #    Messages + Realtime + Presence + pagination
│   │   ├── useVisitePlanner.ts             #    Disponibilités + propose/confirme/annule
│   │   ├── useVisiteDetail.ts              #    Détails visite + countdown + rappels push
│   │   ├── useProfile.ts                   #    Profil + stats + upload avatar
│   │   ├── useKyc.ts                       #    Wizard KYC + upload + statut Realtime
│   │   ├── usePostMedia.ts                 #    Étape 1 formulaire (photos + prix)
│   │   ├── usePostLocation.ts              #    Étape 2 formulaire + publication finale
│   │   ├── useLocation.ts                  #    Géolocalisation utilisateur
│   │   ├── useFavoris.ts                   #    Favoris + Set O(1) + optimistic update
│   │   ├── useAvis.ts                      #    Avis + canLeaveAvis + stats propriétaire
│   │   └── useAlertes.ts                   #    CRUD alertes + find matching properties
│   │
│   ├── services/                           # 📡 Couche d'accès données Supabase
│   │   ├── authService.ts                  #    signUp, signIn, signOut
│   │   ├── propertyService.ts              #    fetchProperties, createProperty, uploadPhotos
│   │   ├── conversationService.ts          #    getOrCreateConversation (gère UNIQUE constraint)
│   │   ├── messageService.ts               #    sendMessage, markAsRead, fetchMessages
│   │   ├── visiteService.ts                #    proposeVisite, confirmerVisite, annulerVisite
│   │   ├── signalementService.ts           #    createSignalement
│   │   ├── profileService.ts               #    updateProfile, uploadAvatar, fetchStats, deleteAccount
│   │   ├── kycService.ts                   #    uploadKycPhoto, submitKycDemande, hasPendingDemande
│   │   ├── notificationService.ts          #    scheduleVisiteReminder, cancelReminders, setBadge
│   │   ├── favoriService.ts                #    toggleFavori, fetchFavoris, subscribeStatusChanges
│   │   ├── avisService.ts                  #    createAvis, canLeaveAvis, fetchAvisProprietaire, stats
│   │   └── alerteService.ts                #    createAlerte, toggleAlerte, findMatchingProperties
│   │
│   ├── store/                              # 🗄️ State management global
│   │   ├── AuthContext.tsx                 #    Session + profil + statut vérification
│   │   ├── UnreadContext.tsx               #    Nombre messages non lus (badge tab bar)
│   │   ├── FavorisContext.tsx              #    Liste favoris + Set<string> des IDs
│   │   ├── ToastContext.tsx                #    showToast() global avec type et durée
│   │   └── PostPropertyStore.ts            #    Zustand : données formulaire annonce (étapes 1+2)
│   │
│   ├── i18n/                               # 🌍 Internationalisation complète
│   │   ├── index.ts                        #    Config i18next + loadSavedLanguage + changeLanguage
│   │   ├── useTranslation.ts               #    Hook + LANGUAGES array exporté
│   │   └── locales/
│   │       ├── fr.json                     #    🇫🇷 Français — langue par défaut et fallback
│   │       ├── en.json                     #    🇬🇧 English
│   │       ├── rw.json                     #    🇷🇼 Kinyarwanda
│   │       └── sw.json                     #    🌍 Kiswahili
│   │
│   ├── lib/
│   │   └── supabase.ts                     #    Client Supabase avec ExpoSecureStore (sessions)
│   │
│   ├── types/
│   │   └── database.types.ts               #    Types TypeScript stricts : toutes entités BDD
│   │
│   ├── constants/
│   │   ├── theme.ts                        #    Couleurs (#1B4FFF, #00C896...), typo, espacements
│   │   └── gisenyi_poi.ts                  #    7 points d'intérêt Gisenyi avec coordonnées
│   │
│   └── utils/
│       ├── formatters.ts                   #    formatPrix (RWF), formatTelephone, formatDateVisite
│       ├── errorMessages.ts                #    Traduction erreurs Supabase → messages lisibles
│       └── imageUtils.ts                   #    compressImage (1200px, 0.85) + validateImageSize
│
├── supabase/
│   └── functions/
│       ├── check-alertes/index.ts          #    Edge Function : INSERT propriete → vérifie alertes
│       │                                   #    → envoie notifs push via Expo API
│       └── send-push-notification/index.ts #    Edge Function : envoi notif depuis le dashboard admin
│
├── assets/images/
│   ├── icon.png                            #    Icône app (1024x1024)
│   ├── splash.png                          #    Écran démarrage
│   └── adaptive-icon.png                   #    Icône adaptative Android
│
├── .env.local                              # ⚠️ Variables Supabase (jamais commité)
├── babel.config.js                         #    Config Babel : presets: ['babel-preset-expo']
├── app.json                                #    Config Expo : nom, icône, permissions caméra/notifs
├── tsconfig.json                           #    TypeScript strict mode
└── package.json
```

### Dashboard Admin

```
inzuhub-admin/
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                 # Navigation gauche + badges temps réel
│   │   │   ├── Header.tsx                  # Barre top + infos admin connecté
│   │   │   └── Layout.tsx                  # Wrapper global Sidebar + Header + contenu
│   │   ├── kyc/
│   │   │   ├── KycTable.tsx                # Tableau + filtres + pagination + Realtime
│   │   │   ├── KycDetailModal.tsx          # 3 photos zoomables + boutons décision
│   │   │   └── KycStatusBadge.tsx          # Badge coloré : en_attente / approuve / rejete
│   │   ├── signalements/
│   │   │   ├── SignalementTable.tsx        # Tableau signalements filtrés
│   │   │   └── SignalementDetailModal.tsx  # Détail + actions (supprimer / ignorer)
│   │   └── ui/
│   │       ├── StatCard.tsx                # Carte stat avec icône + valeur + tendance
│   │       ├── Badge.tsx                   # Badge coloré générique
│   │       └── ConfirmModal.tsx            # Confirmation avant action irréversible
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx                   # Auth admin + vérif est_admin = TRUE
│   │   ├── DashboardPage.tsx               # Stats globales + graphiques recharts
│   │   ├── KycPage.tsx                     # 🪪 Gestion KYC (page principale admin)
│   │   ├── SignalementsPage.tsx            # 🚩 Modération signalements
│   │   ├── UsersPage.tsx                   # 👥 Gestion utilisateurs
│   │   └── PropertiesPage.tsx              # 🏠 Vue admin annonces
│   │
│   └── App.tsx                             # Router + ProtectedRoute (vérifie est_admin)
│
├── .env.local                              # ⚠️ Clés Supabase + service_role_key
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 📦 Prérequis

Avant de commencer, vérifiez que vous avez installé :

| Outil | Version minimum | Commande de vérification | Lien d'installation |
|-------|----------------|-------------------------|---------------------|
| Node.js | 18.x | `node --version` | [nodejs.org](https://nodejs.org/) |
| npm | 9.x | `npm --version` | Inclus avec Node.js |
| Git | 2.x | `git --version` | [git-scm.com](https://git-scm.com/) |
| Expo Go (iOS) | Dernière version | — | App Store |
| Expo Go (Android) | Dernière version | — | Play Store |

Comptes nécessaires :
- **Supabase** (gratuit) → [supabase.com](https://supabase.com) — backend complet
- **Expo** (gratuit) → [expo.dev](https://expo.dev) — pour les builds de production

---

## 🚀 Installation pas à pas

### Étape 1 — Cloner le dépôt

```bash
git clone https://github.com/votre-username/InzuHub.git
cd InzuHub
```

### Étape 2 — Installer toutes les dépendances

```bash
# ⚠️ Le flag --legacy-peer-deps est OBLIGATOIRE
# Sans lui, npm signale des conflits de peer deps entre Expo SDK 54 et certains packages
npm install --legacy-peer-deps
```

### Étape 3 — Installer les packages natifs Expo

```bash
# Navigation et base
npx expo install expo-router expo-linking expo-constants expo-status-bar

# Supabase et stockage local
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage expo-secure-store

# Médias et caméra
npx expo install expo-image-picker expo-image-manipulator expo-file-system expo-camera

# Localisation et notifications
npx expo install expo-notifications expo-location expo-localization

# Carte interactive
npx expo install react-native-maps
```

### Étape 4 — Installer les packages JavaScript

```bash
# Listes performantes, dates, state, polyfills
npm install @shopify/flash-list date-fns zustand react-native-url-polyfill --legacy-peer-deps

# Internationalisation
npm install i18next react-i18next --legacy-peer-deps

# Babel (nécessaire pour Expo)
npm install babel-preset-expo --save-dev --legacy-peer-deps
```

### Étape 5 — Vérifier babel.config.js

Le fichier `babel.config.js` à la racine doit contenir exactement :

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

> Si ce fichier n'existe pas, créez-le. Sans lui, vous aurez l'erreur `Cannot find module 'babel-preset-expo'`.

---

## 🗄️ Configuration Supabase

### 1. Créer le projet

1. Allez sur [supabase.com](https://supabase.com) → **New project**
2. Nommez-le `inzuhub`
3. Choisissez un mot de passe de base de données fort
4. Région : `eu-central-1` (plus proche du Rwanda)
5. Notez votre **Project URL** et **anon public key** dans **Settings → API**

### 2. Exécuter le schéma SQL complet

Dans **SQL Editor** de votre projet Supabase, exécutez :

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Utilisateurs
CREATE TABLE utilisateurs (
  id_utilisateur    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom_complet       TEXT NOT NULL,
  numero_telephone  TEXT NOT NULL UNIQUE,
  role              TEXT NOT NULL CHECK (role IN ('locataire', 'proprietaire')),
  statut_verification TEXT DEFAULT 'non_verifie'
                    CHECK (statut_verification IN ('non_verifie','en_attente','approuve','rejete')),
  push_token        TEXT,
  avatar_url        TEXT,
  est_admin         BOOLEAN DEFAULT FALSE,
  date_inscription  TIMESTAMPTZ DEFAULT NOW()
);

-- Quartiers
CREATE TABLE quartiers (
  id_quartier   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom_quartier  TEXT NOT NULL UNIQUE
);

-- Propriétés
CREATE TABLE proprietes (
  id_propriete     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur   UUID NOT NULL REFERENCES utilisateurs ON DELETE CASCADE,
  id_quartier      UUID REFERENCES quartiers,
  titre            TEXT NOT NULL,
  description      TEXT,
  prix_mensuel     INTEGER NOT NULL,
  garantie_exigee  INTEGER DEFAULT 0,
  nombre_chambres  INTEGER NOT NULL,
  nombre_salons    INTEGER DEFAULT 0,
  has_eau          BOOLEAN DEFAULT FALSE,
  has_electricite  BOOLEAN DEFAULT FALSE,
  has_cloture      BOOLEAN DEFAULT FALSE,
  has_parking      BOOLEAN DEFAULT FALSE,
  statut           TEXT DEFAULT 'disponible'
                   CHECK (statut IN ('disponible','en_discussion','loue')),
  latitude         DECIMAL(10,7),
  longitude        DECIMAL(10,7),
  date_publication TIMESTAMPTZ DEFAULT NOW()
);

-- Photos
CREATE TABLE photos (
  id_photo       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_propriete   UUID NOT NULL REFERENCES proprietes ON DELETE CASCADE,
  url_photo      TEXT NOT NULL,
  est_principale BOOLEAN DEFAULT FALSE,
  ordre          INTEGER DEFAULT 0
);

-- Conversations
CREATE TABLE conversations (
  id_conversation   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_locataire      UUID NOT NULL REFERENCES utilisateurs,
  id_proprietaire   UUID NOT NULL REFERENCES utilisateurs,
  id_propriete      UUID NOT NULL REFERENCES proprietes,
  derniere_activite TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id_locataire, id_propriete)
);

-- Messages
CREATE TABLE messages (
  id_message      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_conversation UUID NOT NULL REFERENCES conversations ON DELETE CASCADE,
  id_expediteur   UUID NOT NULL REFERENCES utilisateurs,
  contenu         TEXT NOT NULL,
  type            TEXT DEFAULT 'texte'
                  CHECK (type IN ('texte','visite_proposee','visite_confirmee','visite_annulee')),
  lu              BOOLEAN DEFAULT FALSE,
  date_envoi      TIMESTAMPTZ DEFAULT NOW()
);

-- Visites
CREATE TABLE visites (
  id_visite       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_conversation UUID NOT NULL REFERENCES conversations,
  date_visite     DATE NOT NULL,
  heure_visite    TIME NOT NULL,
  statut          TEXT DEFAULT 'proposee'
                  CHECK (statut IN ('proposee','confirmee','annulee')),
  date_creation   TIMESTAMPTZ DEFAULT NOW()
);

-- Signalements
CREATE TABLE signalements (
  id_signalement  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur  UUID NOT NULL REFERENCES utilisateurs,
  id_propriete    UUID NOT NULL REFERENCES proprietes,
  motif           TEXT NOT NULL,
  etat_traitement TEXT DEFAULT 'en_attente'
                  CHECK (etat_traitement IN ('en_attente','en_cours','traite')),
  date_signalement TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id_utilisateur, id_propriete)
);

-- Demandes KYC
CREATE TABLE kyc_demandes (
  id_demande      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur  UUID NOT NULL REFERENCES utilisateurs,
  url_recto       TEXT NOT NULL,
  url_verso       TEXT NOT NULL,
  url_selfie      TEXT NOT NULL,
  statut          TEXT DEFAULT 'en_attente'
                  CHECK (statut IN ('en_attente','en_cours_review','approuve','rejete')),
  motif_rejet     TEXT,
  date_soumission TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id_utilisateur)
);

-- Favoris
CREATE TABLE favoris (
  id_favori      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs ON DELETE CASCADE,
  id_propriete   UUID NOT NULL REFERENCES proprietes ON DELETE CASCADE,
  date_ajout     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id_utilisateur, id_propriete)
);

-- Avis
CREATE TABLE avis (
  id_avis          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_auteur        UUID NOT NULL REFERENCES utilisateurs ON DELETE CASCADE,
  id_proprietaire  UUID NOT NULL REFERENCES utilisateurs ON DELETE CASCADE,
  id_visite        UUID NOT NULL REFERENCES visites ON DELETE CASCADE,
  id_propriete     UUID NOT NULL REFERENCES proprietes,
  note             INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire      TEXT,
  date_avis        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id_auteur, id_visite)
);

-- Alertes
CREATE TABLE alertes (
  id_alerte       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur  UUID NOT NULL REFERENCES utilisateurs ON DELETE CASCADE,
  nom_alerte      TEXT NOT NULL,
  id_quartier     UUID REFERENCES quartiers,
  prix_max        INTEGER,
  prix_min        INTEGER,
  nombre_chambres INTEGER,
  has_eau         BOOLEAN,
  has_electricite BOOLEAN,
  est_active      BOOLEAN DEFAULT TRUE,
  date_creation   TIMESTAMPTZ DEFAULT NOW(),
  derniere_notif  TIMESTAMPTZ
);

-- Historique alertes (évite les doublons de notifications)
CREATE TABLE alertes_historique (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_alerte     UUID NOT NULL REFERENCES alertes ON DELETE CASCADE,
  id_propriete  UUID NOT NULL REFERENCES proprietes ON DELETE CASCADE,
  date_envoi    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id_alerte, id_propriete)
);
```

### 3. Insérer les 10 quartiers de Gisenyi

```sql
INSERT INTO quartiers (nom_quartier) VALUES
  ('Majengo'), ('Mbugangari'), ('Bugoyi'),
  ('Rubavu'), ('Bigogwe'), ('Mudende'),
  ('Rwerere'), ('Nyakiriba'), ('Centre-Ville'), ('Bord du Lac');
```

### 4. Activer RLS sur toutes les tables

```sql
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proprietes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE visites ENABLE ROW LEVEL SECURITY;
ALTER TABLE signalements ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_demandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes_historique ENABLE ROW LEVEL SECURITY;
```

### 5. Créer les buckets Storage

Dans **Storage → New bucket** :

| Bucket | Public | Usage |
|--------|--------|-------|
| `property-photos` | ✅ Oui | Photos des annonces immobilières |
| `avatars` | ✅ Oui | Photos de profil des utilisateurs |
| `kyc-documents` | ❌ Non | Documents identité KYC — accès admin via URL signée uniquement |

### 6. Configurer le webhook pour les alertes

Dans **Database → Webhooks → Create Webhook** :
- **Table :** `proprietes`
- **Events :** `INSERT`
- **URL :** `https://[votre-projet].supabase.co/functions/v1/check-alertes`

### 7. Définir votre compte admin

```sql
-- Après avoir créé votre compte dans l'app mobile :
UPDATE utilisateurs
SET est_admin = TRUE
WHERE numero_telephone = '+250788XXXXXX';  -- votre numéro
```

---

## 🔑 Variables d'environnement

### App Mobile — `.env.local` (à la racine de `InzuHub/`)

```env
# Trouvez ces valeurs dans Supabase → Settings → API
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Dashboard Admin — `inzuhub-admin/.env.local`

```env
# Même projet Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ⚠️ DANGER : service_role_key = accès root à la base de données
# Uniquement pour le dashboard admin en local ou sur domaine sécurisé
# JAMAIS dans l'app mobile, JAMAIS sur GitHub
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> 🔒 Ces fichiers `.env.local` sont dans le `.gitignore`. Ne les commitez **jamais**.

---

## ▶️ Lancer le projet

### Application Mobile

```bash
# Recommandé — vide le cache Metro au démarrage
npx expo start --clear

# Si vous êtes hors ligne ou sans accès aux serveurs Expo
npx expo start --clear --offline

# Si votre réseau bloque le QR code (réseau d'entreprise, VPN)
npx expo start --clear --tunnel
```

Scannez le QR code :
- **iOS** → Ouvrez **Appareil photo** et pointez vers le QR code
- **Android** → Ouvrez **Expo Go** et appuyez sur "Scan QR code"

### Dashboard Admin

```bash
cd inzuhub-admin
npm install
npm run dev
# → http://localhost:5173
```

---

## 🐛 Résolution des erreurs courantes

### ❌ `Cannot find module 'babel-preset-expo'`

```bash
npm install babel-preset-expo --save-dev --legacy-peer-deps
npx expo start --clear
```

Vérifiez aussi que `babel.config.js` existe et contient `presets: ['babel-preset-expo']`.

---

### ❌ `Incompatible React versions: react 19.2.4 vs react-native-renderer 19.1.0`

**Cause :** Vous avez mis à jour React manuellement. Expo SDK 54 nécessite exactement React `19.1.0`.

```bash
npm install react@19.1.0 react-dom@19.1.0 --save --legacy-peer-deps
npx expo start --clear
```

> ⚠️ Règle absolue : ne jamais modifier manuellement les versions de `react` et `react-native`.

---

### ❌ `ERESOLVE could not resolve` lors de `npm install`

```bash
# Toujours ajouter --legacy-peer-deps sur ce projet
npm install --legacy-peer-deps
```

---

### ❌ `TypeError: fetch failed` au démarrage de Metro

Erreur réseau non bloquante (Expo essaie de vérifier les versions en ligne).

```bash
# Solution 1 : mode offline
npx expo start --clear --offline

# Solution 2 : proxy d'entreprise (Windows)
set HTTPS_PROXY=http://votre-proxy:port
npx expo start --clear
```

Sur Windows : autorisez `node.exe` dans le pare-feu Windows Defender.

---

### 🔄 Reset complet (si rien ne fonctionne)

```bash
# Windows
rd /s /q node_modules
del package-lock.json

# Mac / Linux
rm -rf node_modules package-lock.json

# Réinstaller et relancer
npm install --legacy-peer-deps
npx expo start --clear
```

---

## 📱 Structure des écrans et parcours utilisateur

### Parcours Locataire

```
📱 Premier lancement
      └── Sélection langue (FR / EN / RW / SW)
                │
                ▼
      Écran Login / Register
      ├── Login → numéro + mot de passe → Accueil
      └── Register → nom + téléphone + MDP + rôle → Accueil

🏠 Onglet Accueil
   ├── FlashList annonces disponibles
   ├── Recherche texte (debounce 400ms)
   ├── Chips quartiers scrollables
   ├── Bouton filtres → FilterModal
   │     ├── Budget min/max RWF
   │     ├── Nombre de chambres minimum
   │     └── Équipements requis
   ├── Bannière "Créez une alerte" (si 0 alertes, une seule fois)
   └── Tap PropertyCard → Fiche Détaillée
               ├── Galerie photos (swipe + plein écran)
               ├── Prix + garantie + total entrée (calculé auto)
               ├── Équipements (eau ✓ / ✗, électricité ✓ / ✗...)
               ├── Description avec ReadMore
               ├── Mini-carte + bouton itinéraire Google Maps
               ├── Profil propriétaire + ★ note moyenne + badge vérifié
               ├── Section avis : moyenne + barres répartition + 3 derniers avis
               ├── ❤️ FavorisButton (top-right, animation bounce)
               ├── 📞 Appeler directement
               ├── 🚩 Signaler l'annonce
               └── 💬 [Contacter] → Conversation
                           ├── Message de bienvenue automatique
                           ├── Messages temps réel (Supabase Realtime)
                           ├── TypingIndicator (3 points pulsants)
                           ├── Indicateurs lecture ✓ / ✓✓
                           └── [📅] → VisiteWidget
                                       ├── Étape 1 : Calendrier 30 jours
                                       │           (dimanches grisés)
                                       ├── Étape 2 : Créneaux 08h-18h/30min
                                       │           (disponibilité vérifiée)
                                       └── Étape 3 : Confirmation + envoi
                                                   └── Carte visite dans chat
                                                       ├── [Confirmer] (propriétaire)
                                                       └── [Refuser] (propriétaire)
                                                                   │
                                                                   ▼
                                                         Écran Confirmation Visite
                                                         ├── Countdown temps réel
                                                         ├── Rappels push (24h, 2h, heure)
                                                         ├── Itinéraire Google Maps
                                                         ├── Conseils visite (selon rôle)
                                                         ├── [Ajouter au calendrier]
                                                         └── [Annuler la visite]
                                                                     │ (si visite passée)
                                                                     ▼
                                                           Bannière "Laisser un avis"
                                                           └── AvisModal
                                                               ├── 1-5 étoiles + label
                                                               └── Commentaire optionnel

🗺️ Onglet Carte
   ├── Carte Gisenyi react-native-maps
   ├── Marqueurs prix colorés (vert/orange/rouge + ★)
   ├── 7 POI de la ville
   ├── Bouton 🎯 recentrer sur Gisenyi
   ├── Filtres rapides (chambres, eau, électricité)
   └── Tap marqueur → PropertyPreviewPanel slide-up
               └── "Voir détails →" → Fiche Détaillée

💬 Onglet Messages (badge rouge non lus)
   ├── Sections : Aujourd'hui / Cette semaine / Avant
   ├── Swipe gauche → fond rouge + 🗑 → Alert confirmation
   └── Tap → Discussion Active

👤 Onglet Profil
   ├── Hero : avatar (modifiable) + nom + rôle + date inscription
   ├── Badge KYC : ✅ vérifié ou ⚠️ non vérifié
   ├── Grille stats (conversations / visites / favoris / avis reçus)
   ├── Section "Mes Visites" (À venir | Passées)
   │     └── Bouton "⭐ Laisser un avis" (si visite passée + pas d'avis)
   ├── Menu Actions :
   │     ├── ❤️ Mes favoris (badge count)
   │     │     └── FlashList + swipe supprimer + alerte si statut change
   │     ├── 🔔 Mes alertes (badge count)
   │     │     ├── AlerteCard x5 max avec toggle on/off
   │     │     └── AlerteFormModal (nom + quartier + budget + chambres + équipements)
   │     ├── 🪪 Vérifier mon identité → KYC
   │     └── ⚙️ Paramètres
   │           ├── 🌍 Langue → LanguageSelector (FR/EN/RW/SW)
   │           ├── 🔔 Notifications push (toggle)
   │           ├── 🔑 Changer mot de passe (resetPasswordForEmail)
   │           ├── 📋 Conditions d'utilisation
   │           ├── 🔒 Politique de confidentialité
   │           └── 🗑 Supprimer mon compte (double confirmation)
   └── 🔴 Se déconnecter (confirmation)
```

### Parcours Propriétaire

```
👤 Profil → [+ Publier une annonce]
      │
      ▼
📸 Étape 1 — Médias & Prix (barre progression 50%)
   ├── PhotoGrid 3 colonnes
   │     ├── Bouton "+ Ajouter" → Alert [📷 Caméra] [🖼 Galerie]
   │     ├── Chaque photo : progress upload + bouton ✕ + tap = photo principale
   │     └── Photo principale : bordure bleue 3px + badge "★ Principale"
   ├── Prix mensuel (RWF) avec aperçu "= 150 000 RWF/mois"
   ├── Garantie : pills [0][1][2][3][6][12] mois
   └── Récapitulatif financier (loyer + garantie × mois = total entrée)
   │
   ▼ [Suivant : Localisation →] (actif seulement si ≥3 photos + prix)
   │
📍 Étape 2 — Localisation & Détails (barre progression 100%)
   ├── Titre (compteur /100) + suggestions rapides description
   ├── QuartierPicker (BottomSheet avec recherche en temps réel)
   ├── MapPickerModal (tap ou drag pour placer, POI Gisenyi affichés)
   ├── StepperInput chambres (1-20) + salons (0-10)
   ├── 4 EquipementToggle (eau / électricité / clôture / parking)
   └── AnnoncePreview (exactement comme une PropertyCard avec badge "APERÇU")
   │
   ▼ [Publier l'annonce]
   │   Si pas de coordonnées → Alert "Publier sans position ?"
   │   Si erreur upload → rollback (DELETE propriété) + données conservées
   │
   ▼ router.replace('/post/success') — pas de retour arrière possible
   │
🎉 Écran Succès
   ├── Aperçu photo principale + titre + quartier + prix
   ├── Conseils pour recevoir plus de demandes
   ├── [Voir mon annonce →] → Fiche Détaillée
   ├── [Retour à l'accueil]
   └── [⚠ Vérifier mon identité] (si KYC non fait)
```

### Parcours KYC — Vérification d'Identité

```
👤 Profil → Badge "⚠️ Non Vérifié" → [Vérifier mon identité]
      │
      ▼
🪪 Intro (étape 1/6)
   ├── Ce dont vous avez besoin : Indangamuntu + éclairage + 2 minutes
   └── Ce que nous faisons : chiffrement, accès limité, suppression après vérification
      │
      ▼
📷 Recto carte d'identité (étape 2/6)
   ├── Cadre pointillé ratio 85.6:54 (format réel carte)
   ├── Conseils : lumière, lisibilité, pas de reflets
   └── [📷 Prendre une photo] ou [🖼 Galerie]
      │
      ▼
📷 Verso carte d'identité (étape 3/6)
      │
      ▼
🤳 Selfie avec la carte (étape 4/6 — caméra frontale)
   └── Guide visuel : tenez la carte à côté de votre visage
      │
      ▼
✅ Review (étape 5/6)
   ├── Grille 3 aperçus (RECTO / VERSO / SELFIE) + bouton 🔄 Revoir chacun
   └── ☑️ Déclaration légale obligatoire
      │
      ▼ [Soumettre ma vérification]
      │   Compression + upload sécurisé → bucket privé kyc-documents
      │
      ▼
⏳ KycStatusScreen (Supabase Realtime)
   ├── en_attente → ⏱ Délai 24-48h + conseil
   ├── en_cours_review → 🔍 Notre équipe examine votre dossier
   ├── approuve → ✅ Notification push + badge activé sur toutes les annonces
   └── rejete → ❌ Motif affiché + [→ Resoumettre mon dossier]
```

### Parcours Dashboard Admin

```
🖥️ https://admin.inzuhub.rw/login
   └── Connexion avec numéro + MDP
       └── Vérification est_admin = TRUE (via RLS)
           ├── est_admin = FALSE → "Accès refusé" + déconnexion
           └── est_admin = TRUE →

📊 Dashboard — Vue d'ensemble
   ├── 4 StatCard : Utilisateurs / Annonces / KYC en attente / Signalements
   │     └── Fond rouge si >10 KYC, fond orange si >5 signalements
   ├── LineChart : inscriptions par jour (30 derniers jours)
   └── BarChart : annonces par quartier de Gisenyi

🪪 Page KYC — La plus importante
   ├── Pills filtres : Tous / En attente / En review / Approuvés / Rejetés
   ├── Recherche par nom ou numéro de téléphone
   ├── Tableau Realtime (nouvelle demande → ligne apparaît + son notification)
   └── Bouton "🔍 Examiner" → KycDetailModal
               ├── 3 photos (recto / verso / selfie) avec zoom plein écran
               ├── [✅ Approuver]
               │     → UPDATE statut = 'approuve'
               │     → UPDATE statut_verification = 'approuve'
               │     → Notification push : "✅ Votre identité est vérifiée !"
               │     → Badge ✓ activé sur toutes les annonces
               │     → Fermeture + refresh tableau
               └── [❌ Rejeter] → sélection motif obligatoire
                     → UPDATE statut = 'rejete' + motif_rejet
                     → Notification push : "❌ Motif : [motif]"
                     → L'utilisateur peut resoumettre depuis l'app

🚩 Page Signalements
   ├── Tableau : annonce + motif + auteur + date + statut
   ├── [👁 Voir annonce] → ouvre la fiche dans un onglet
   ├── [🗑 Supprimer l'annonce] → ConfirmModal → DELETE + traiter signalement
   └── [✓ Ignorer] → marquer etat_traitement = 'traite'

👥 Page Utilisateurs
   ├── Filtres : Tous / Propriétaires / Locataires / Vérifiés / Non vérifiés
   ├── Recherche par nom ou numéro
   ├── [🔒 Suspendre] → désactive le compte
   └── [🗑 Supprimer] → ConfirmModal → suppression si aucune conversation active

🏠 Page Annonces
   ├── Filtres : Tous / Disponibles / Loués + filtre quartier
   └── [🗑 Supprimer] → ConfirmModal → suppression définitive
```

---

## 🗃️ Schéma de base de données

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   utilisateurs  │    │    proprietes    │    │    quartiers    │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ id_utilisateur  │◄──┐│ id_propriete    │    │ id_quartier     │
│ nom_complet     │   ││ id_utilisateur  │    │ nom_quartier    │
│ numero_telephone│   ││ id_quartier    │───►└─────────────────┘
│ role            │   ││ titre           │
│ statut_verif.   │   ││ prix_mensuel    │    ┌─────────────────┐
│ push_token      │   ││ garantie_exigee │    │     photos      │
│ avatar_url      │   ││ nombre_chambres │    ├─────────────────┤
│ est_admin       │   ││ has_eau         │◄──┐│ id_photo        │
└─────────────────┘   ││ has_electricite │   ││ id_propriete    │
                      ││ has_cloture     │   ││ url_photo       │
                      ││ has_parking     │   ││ est_principale  │
┌─────────────────┐   ││ statut          │   └─────────────────┘
│  conversations  │   ││ latitude        │
├─────────────────┤   ││ longitude       │
│ id_conversation │   └──────────────────┘
│ id_locataire    │──┘
│ id_proprietaire │
│ id_propriete    │   ┌─────────────────┐    ┌─────────────────┐
│ derniere_activ. │   │    messages     │    │     visites     │
└────────┬────────┘   ├─────────────────┤    ├─────────────────┤
         └───────────►│ id_message      │    │ id_visite       │
                      │ id_conversation │    │ id_conversation │
                      │ id_expediteur   │    │ date_visite     │
                      │ contenu         │    │ heure_visite    │
                      │ type            │    │ statut          │
                      │ lu              │    └─────────────────┘
                      └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  signalements   │    │  kyc_demandes   │    │    favoris      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id_signalement  │    │ id_demande      │    │ id_favori       │
│ id_utilisateur  │    │ id_utilisateur  │    │ id_utilisateur  │
│ id_propriete    │    │ url_recto       │    │ id_propriete    │
│ motif           │    │ url_verso       │    │ date_ajout      │
│ etat_traitement │    │ url_selfie      │    └─────────────────┘
└─────────────────┘    │ statut          │
                       │ motif_rejet     │    ┌─────────────────┐
                       └─────────────────┘    │      avis       │
                                              ├─────────────────┤
┌─────────────────┐    ┌─────────────────┐    │ id_avis         │
│    alertes      │    │alertes_historique│   │ id_auteur       │
├─────────────────┤    ├─────────────────┤    │ id_proprietaire │
│ id_alerte       │───►│ id_alerte       │    │ id_visite       │
│ id_utilisateur  │    │ id_propriete    │    │ id_propriete    │
│ nom_alerte      │    │ date_envoi      │    │ note (1-5)      │
│ id_quartier     │    └─────────────────┘    │ commentaire     │
│ prix_min        │                           └─────────────────┘
│ prix_max        │
│ nombre_chambres │
│ has_eau         │
│ has_electricite │
│ est_active      │
│ derniere_notif  │
└─────────────────┘
```

---

## 🔒 Sécurité & RLS

InzuHub utilise **Row Level Security (RLS)** de PostgreSQL — chaque requête passe obligatoirement par les politiques d'accès, même avec les clés API.

| Table | Lecture | Création | Modification | Suppression |
|-------|---------|---------|-------------|------------|
| `quartiers` | Tout le monde | Admin | Admin | Admin |
| `utilisateurs` | Tout le monde (champs publics) | Auth signup | Propriétaire | Propriétaire |
| `proprietes` | Public si `disponible` | Utilisateur connecté | Propriétaire ou Admin | Propriétaire ou Admin |
| `photos` | Tout le monde | Propriétaire annonce | Propriétaire annonce | Propriétaire annonce |
| `conversations` | Participants uniquement | Locataire (création) | — | Participants |
| `messages` | Participants uniquement | Participants | Expéditeur (marquer lu) | — |
| `visites` | Participants uniquement | Locataire | Participants | Participants |
| `signalements` | Auteur + Admin | Utilisateur connecté | Admin | Admin |
| `kyc_demandes` | Auteur + Admin | Utilisateur connecté | Admin uniquement | — |
| `favoris` | Propriétaire uniquement | Utilisateur connecté | — | Propriétaire uniquement |
| `avis` | Tout le monde | Auteur visite confirmée | — | Auteur |
| `alertes` | Propriétaire uniquement | Utilisateur connecté | Propriétaire uniquement | Propriétaire uniquement |

### Buckets Storage — Niveaux d'accès

| Bucket | Type | URL | Accès lecture |
|--------|------|-----|--------------|
| `property-photos` | Public | URL directe | Tout le monde |
| `avatars` | Public | URL directe | Tout le monde |
| `kyc-documents` | **Privé** | URL signée (expire 1h) | Admin via `createSignedUrl()` uniquement |

---

## 🌍 Multi-langue

InzuHub est entièrement traduit en **4 langues**, couvrant toutes les langues parlées à Gisenyi et dans la région des Grands Lacs :

| Code | Langue | Drapeau | Utilisateurs cibles |
|------|--------|---------|---------------------|
| `fr` | Français | 🇫🇷 | Fonctionnaires, éduqués, administratifs |
| `en` | English | 🇬🇧 | Diaspora, expatriés, étudiants |
| `rw` | Kinyarwanda | 🇷🇼 | Majorité des Rwandais (langue nationale) |
| `sw` | Kiswahili | 🌍 | Communauté congolaise, commerçants frontaliers |

### Fonctionnement technique

```
1. Premier lancement
   └── expo-localization détecte la langue du téléphone
       ├── Téléphone en 'rw' → Kinyarwanda
       ├── Téléphone en 'sw' ou 'swh' → Swahili
       ├── Téléphone en 'en' → English
       └── Autre → Français (défaut)

2. Persistance
   └── AsyncStorage key: 'inzuhub_language'
       → Langue mémorisée entre les sessions

3. Changement manuel
   └── Paramètres → 🌍 Langue
       └── LanguageSelector : 4 options avec drapeaux
           → changeLanguage(code) → AsyncStorage + i18n.changeLanguage()
           → Toast "Langue modifiée" + fermeture automatique

4. Fallback
   └── Clé manquante dans rw.json ou sw.json
       → Utilise automatiquement la valeur de fr.json
```

### Où changer la langue

- **Avant connexion :** Bouton 🌍 visible en haut à droite de l'écran login/register
- **Après connexion :** Onglet Profil → ⚙️ Paramètres → 🌍 Langue de l'application

---

## 🖥️ Dashboard Admin

Application web **séparée** (React + Vite + Tailwind CSS), connectée au même projet Supabase.

### Accès

| Environnement | URL | Prérequis |
|--------------|-----|-----------|
| Développement | `http://localhost:5173` | `npm run dev` dans `inzuhub-admin/` |
| Production | `https://admin.inzuhub.rw` | Déploiement Vercel + domaine custom |

Pour accéder, votre compte doit avoir `est_admin = TRUE` dans Supabase (sinon : "Accès refusé").

### Pages disponibles

| Page | Description | Fonctionnalités clés |
|------|-------------|---------------------|
| 📊 **Dashboard** | Vue d'ensemble plateforme | Stats globales, graphiques 30j, dernières demandes KYC |
| 🪪 **KYC** | Gestion vérifications identité | Examen 3 photos avec zoom, approbation/rejet, notif push auto, Realtime |
| 🚩 **Signalements** | Modération annonces | Supprimer annonce ou ignorer signalement |
| 👥 **Utilisateurs** | Gestion comptes | Recherche, suspension, suppression |
| 🏠 **Annonces** | Vue admin annonces | Filtres, suppression directe |

### Déploiement sur Vercel

```bash
cd inzuhub-admin
npm run build

# Via Vercel CLI
npx vercel

# Ou connecter le repo GitHub à Vercel :
# 1. Push inzuhub-admin/ sur GitHub
# 2. Connecter à vercel.com
# 3. Ajouter les 3 variables d'environnement
# 4. Configurer le domaine admin.inzuhub.rw
```

---

## 🗺️ Points d'intérêt de Gisenyi

7 repères réels affichés sur la carte pour aider les utilisateurs à évaluer la proximité d'un logement :

| POI | Icône | Type | Coordonnées | Pourquoi c'est important |
|-----|-------|------|------------|--------------------------|
| Lac Kivu | 🌊 | Nature | -1.7050, 29.2380 | Repère principal, très prisé |
| Marché Central | 🛒 | Commerce | -1.6978, 29.2571 | Courses quotidiennes |
| Hôpital de Rubavu | 🏥 | Santé | -1.6920, 29.2610 | Hôpital de référence du district |
| Université du Lac Kivu | 🎓 | Éducation | -1.7100, 29.2450 | ULK Gisenyi — beaucoup d'étudiants locataires |
| Gare Routière | 🚌 | Transport | -1.6995, 29.2590 | Connexions Kigali, Musanze, Nord |
| Frontière Petite Barrière | 🛂 | Frontière | -1.6880, 29.2210 | Rwanda-RDC (Goma) — fort trafic commercial |
| Serena Hotel | 🏨 | Hôtel | -1.7080, 29.2340 | Repère bord du lac Kivu |

---

## 🗺️ Roadmap

> 💡 **Vision globale d'InzuHub en 5 versions :**
>
> | Version | Périmètre | Horizon |
> |---------|-----------|---------|
> | **v1.0** ✅ | MVP Gisenyi — app complète, fonctionnelle, prête au lancement | Maintenant |
> | **v1.1** 🔄 | Améliorations UX + nouvelles fonctionnalités Gisenyi | 2-3 mois |
> | **v2.0** 🚀 | Expansion nationale Rwanda + Mobile Money + Contrats | 6-9 mois |
> | **v3.0** 🌍 | Afrique de l'Est + Intelligence Artificielle + B2B | 18-24 mois |
> | **v4.0** 🏦 | Super-app : FinTech + services logement + vente immobilière | 2-3 ans |
> | **v5.0** 🌐 | Plateforme pan-africaine + 15 pays + 2M utilisateurs | 3-5 ans |

---

### ✅ Version 1.0 — MVP Gisenyi — Complète et fonctionnelle
> **Périmètre :** Gisenyi (District de Rubavu), Rwanda — Application de base prête à être lancée.

- [x] Architecture React Native + Expo Router + TypeScript strict
- [x] Base de données Supabase + RLS sur toutes les tables
- [x] Authentification par numéro de téléphone rwandais
- [x] Exploration immobilière avec filtres avancés
- [x] Carte interactive de Gisenyi avec 7 POI réels
- [x] Fiche détaillée avec galerie photos immersive
- [x] InzuChat — messagerie temps réel (Supabase Realtime)
- [x] Planification de visites (calendrier 30 jours + créneaux horaires)
- [x] Confirmation de visite avec countdown + rappels push automatiques
- [x] Profil utilisateur complet avec stats
- [x] Vérification KYC (Indangamuntu) — wizard 6 étapes
- [x] Dépôt d'annonces en 2 étapes avec MapPicker
- [x] Multi-langue : Français, English, Kinyarwanda, Kiswahili
- [x] Système de Favoris avec alertes changement de statut
- [x] Notes & Avis (1-5 étoiles) avec stats et répartition
- [x] Alertes personnalisées + Edge Function notifications push
- [x] Dashboard Admin web (KYC, signalements, utilisateurs, annonces)

### 🔄 Version 1.1 — Améliorations de l'expérience utilisateur
> **Objectif :** Peaufiner l'app de Gisenyi avant d'ouvrir à d'autres villes. Durée estimée : 2-3 mois après v1.0.

- [ ] **Mode sombre (Dark Mode)** — thème sombre complet respectant le design system existant
- [ ] **Partage d'annonce** — partager via WhatsApp, SMS ou lien direct (deep link `inzuhub://property/[id]`)
- [ ] **Historique des recherches** — les 10 dernières recherches sauvegardées localement
- [ ] **Comparaison de logements** — comparer 2 annonces côte à côte (prix, chambres, équipements)
- [ ] **Export PDF** — générer une fiche PDF d'une annonce pour partage hors-ligne
- [ ] **Stats propriétaires avancées** — tableau de bord : vues, contacts reçus, taux de réponse, conversions
- [ ] **Réponse aux avis** — le propriétaire peut répondre publiquement aux avis des locataires
- [ ] **Filtre prix sur la carte** — slider min/max directement sur la vue cartographique
- [ ] **Onboarding interactif** — tutoriel guidé au premier lancement (swipe slides + highlights)
- [ ] **Recherche vocale** — dicter sa recherche (expo-speech) pour les utilisateurs moins à l'aise avec le clavier

---

### 🚀 Version 2.0 — Expansion nationale Rwanda
> **Objectif :** Passer de Gisenyi à tout le Rwanda. Intégration financière et légale. Durée estimée : 6-9 mois après v1.0.

**🗺️ Expansion géographique**
- [ ] **Autres villes du Rwanda** — Kigali (Nyamirambo, Kimironko, Kicukiro), Musanze, Huye (Butare), Nyagatare, Rubavu complet
- [ ] **Cartographie nationale** — POI adaptés à chaque ville (hôpitaux, universités, marchés locaux)
- [ ] **Filtrage par ville** — sélecteur de ville en haut de l'app avec mémoire du dernier choix

**💸 Intégration financière**
- [ ] **Paiement caution Mobile Money** — MTN MoMo + Airtel Money via Paypack.rw (Made in Rwanda)
- [ ] **Reçu de paiement numérique** — PDF généré automatiquement après chaque transaction
- [ ] **Historique des transactions** — suivi de tous les paiements caution dans l'app
- [ ] **Remboursement caution** — le propriétaire initie le remboursement via l'app à la fin du bail

**📄 Aspect légal et contractuel**
- [ ] **Contrats de location numériques** — génération automatique d'un contrat type basé sur les données de l'annonce
- [ ] **Signature électronique** — signature du contrat par les deux parties directement dans l'app
- [ ] **Archivage contrats** — stockage sécurisé des contrats signés dans Supabase Storage

**🖥️ Outils professionnels**
- [ ] **Application web propriétaires** — dashboard React complet pour gérer plusieurs propriétés
- [ ] **API publique InzuHub** — endpoints REST documentés pour les partenaires immobiliers et agences
- [ ] **Intégration Google Calendar** — synchronisation automatique des visites confirmées

---

### 🌍 Version 3.0 — Expansion Afrique de l'Est + Intelligence Artificielle
> **Objectif :** Devenir la référence de la location immobilière en Afrique de l'Est. Intégrer l'IA pour personnaliser l'expérience. Durée estimée : 12-18 mois après v2.0.

**🌍 Expansion régionale**
- [ ] **Burundi** — Bujumbura, Gitega (marché très similaire à Gisenyi)
- [ ] **RDC (Congo)** — Goma, Bukavu (zone des Grands Lacs, déjà forte connexion avec Gisenyi)
- [ ] **Ouganda** — Kampala, Mbarara
- [ ] **Tanzanie** — Dar es Salaam, Arusha
- [ ] **Nouvelles langues** — Kirundi 🇧🇮, Lingala 🇨🇩, Luganda 🇺🇬 en plus des 4 existantes

**🤖 Intelligence Artificielle**
- [ ] **Recommandations personnalisées** — algorithme ML qui apprend les préférences de chaque locataire (prix, quartier, équipements) et suggère des annonces adaptées
- [ ] **Estimation prix automatique** — IA qui suggère un prix de loyer réaliste aux propriétaires selon le quartier, la taille et les équipements (analyse des annonces similaires)
- [ ] **Détection fraude** — IA qui signale automatiquement les annonces suspectes (doublons, prix anormaux, photos volées) avant même la modération humaine
- [ ] **Assistant InzuBot** — chatbot intégré dans l'app pour répondre aux questions fréquentes des utilisateurs en FR/EN/RW/SW
- [ ] **Analyse photos** — IA qui vérifie automatiquement la qualité et la pertinence des photos uploadées
- [ ] **Score de confiance** — algorithme combinant KYC + avis + historique pour attribuer un score de fiabilité aux propriétaires

**📊 Analytics avancés**
- [ ] **Heatmap des prix** — carte de chaleur montrant les zones les plus chères/abordables par ville
- [ ] **Tendances du marché** — graphiques d'évolution des prix moyens par quartier sur 12 mois
- [ ] **Rapport mensuel propriétaire** — email automatique avec les stats de ses annonces

**🏢 Offre B2B**
- [ ] **InzuHub Pro pour agences** — abonnement mensuel pour les agences immobilières avec outils avancés
- [ ] **Multi-propriétés** — les promoteurs immobiliers peuvent gérer des dizaines d'annonces depuis un seul compte
- [ ] **Intégration ERP** — connecteurs pour les logiciels de gestion immobilière professionnels

---

### 🏦 Version 4.0 — Écosystème FinTech & Services Associés
> **Objectif :** Faire d'InzuHub une super-app de l'immobilier africain : au-delà de la mise en relation, proposer tous les services liés au logement. Durée estimée : 18-24 mois après v3.0.

**🏦 Services financiers immobiliers**
- [ ] **InzuCredit — Micro-prêt caution** — partenariat avec des microfinances locales (UMURENGE SACCO au Rwanda) pour financer la caution des locataires qui n'ont pas les fonds
- [ ] **Assurance loyer impayé** — le propriétaire s'abonne pour être couvert si le locataire ne paie pas
- [ ] **Assurance habitation** — partenariat avec compagnies d'assurance locales (SONARWA, PHOENIX) pour proposer une assurance aux locataires directement depuis l'app
- [ ] **Épargne caution** — compte d'épargne dédié pour les locataires : versements mensuels automatiques pour préparer la caution du prochain logement
- [ ] **Crédit immobilier** — partenariat avec les banques rwandaises (BK, Equity, I&M) pour mettre en relation les acheteurs potentiels avec des offres de prêt immobilier

**🔧 Services logement connexes**
- [ ] **InzuFix — Artisans à domicile** — mise en relation avec des plombiers, électriciens, peintres vérifiés KYC pour les réparations
- [ ] **InzuMove — Déménagement** — réservation de camions et équipes de déménagement directement dans l'app
- [ ] **InzuClean — Ménage** — service de nettoyage professionnel avant emménagement / après déménagement
- [ ] **InzuNet — Internet** — partenariat avec MTN, Airtel, RwandaTel pour souscrire à une box internet depuis l'app lors de l'emménagement

**🏘️ Vente immobilière**
- [ ] **Module vente** — extension d'InzuHub aux biens à vendre (terrains, maisons, appartements)
- [ ] **Estimation valeur bien** — IA d'estimation du prix de vente basée sur le marché local
- [ ] **Visites virtuelles 360°** — upload de tours virtuels dans les annonces de vente

**🌐 Plateforme ouverte**
- [ ] **Marketplace partenaires** — les banques, assureurs, artisans peuvent référencer leurs services sur InzuHub
- [ ] **Programme affiliés** — commissionnement des utilisateurs qui recommandent InzuHub (parrainage)
- [ ] **InzuHub API v2** — API complète avec webhooks pour les intégrations tierces

---

### 🌍 Version 5.0 — Plateforme Pan-Africaine
> **Objectif :** Devenir le leader de l'immobilier locatif en Afrique subsaharienne francophone. Lever des fonds Series A pour accélérer l'expansion. Horizon : 3-5 ans après le lancement.

**🌍 Expansion continentale**
- [ ] **Afrique de l'Ouest francophone** — Côte d'Ivoire (Abidjan), Sénégal (Dakar), Cameroun (Douala, Yaoundé), Mali (Bamako) — marchés à fort potentiel et similaire problématique commissionnaires
- [ ] **Afrique centrale** — Gabon (Libreville), Congo-Brazzaville, Tchad (N'Djamena)
- [ ] **Afrique australe** — Zambie (Lusaka), Zimbabwe (Harare), Mozambique (Maputo)
- [ ] **10+ langues locales** — Wolof 🇸🇳, Dioula 🇨🇮, Lingala 🇨🇬, Haoussa, Amharique, Zulu...
- [ ] **Devises multiples** — XOF (FCFA), NGN, KES, ZMW, MZN... avec conversion en temps réel

**🏗️ Infrastructure scalable**
- [ ] **Migration vers architecture microservices** — séparation des services (auth, annonces, chat, paiements) pour scalabilité indépendante
- [ ] **CDN africain** — utilisation de Cloudflare Africa PoPs (Nairobi, Lagos, Johannesburg) pour réduire la latence
- [ ] **Mode hors-ligne poussé** — cache complet des annonces vues pour consultation sans connexion (crucial dans les zones à faible connectivité)
- [ ] **Version Ultra-Légère** — app < 5 MB pour les téléphones d'entrée de gamme et connexions 2G/3G

**🤝 Partenariats stratégiques**
- [ ] **ONU-Habitat** — programme de logement abordable pour les populations à faibles revenus
- [ ] **AFD (Agence Française de Développement)** — financement de l'expansion dans les pays francophones
- [ ] **IFC (Banque mondiale)** — investissement dans la FinTech immobilière africaine
- [ ] **Gouvernements locaux** — intégration aux registres fonciers officiels pour validation des titres de propriété

**💰 Modèle économique à grande échelle**

| Source de revenus | Description | Potentiel |
|---|---|---|
| Abonnement Pro propriétaires | 5-15 $/mois pour fonctionnalités avancées | Récurrent |
| Commission transactions | 0.5-1% sur paiements Mobile Money | Variable |
| InzuHub Pro agences | 50-200 $/mois selon le pays | B2B récurrent |
| Publicité ciblée | Matériaux de construction, meubles, banques | CPM/CPC |
| Données marché anonymisées | Rapports de tendances pour investisseurs | Ponctuels |
| Services associés (Fix/Move/Clean) | Commission sur chaque transaction | Variable |

**🎯 Indicateurs cibles Version 5.0**

| KPI | Objectif |
|-----|---------|
| Pays couverts | 15+ pays africains |
| Utilisateurs actifs | 2 millions / mois |
| Annonces actives | 500 000+ |
| Langues supportées | 15+ |
| Transactions Mobile Money | 50 000 / mois |
| Valeur totale transactions | 10M $ / mois |

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment participer au projet :

### Processus de contribution

1. **Forkez** le projet sur GitHub
2. **Clonez** votre fork :
   ```bash
   git clone https://github.com/votre-username/InzuHub.git
   ```
3. **Créez** une branche descriptive :
   ```bash
   git checkout -b feature/partage-annonce-whatsapp
   ```
4. **Développez** votre fonctionnalité en respectant les standards
5. **Committez** avec un message clair :
   ```bash
   git commit -m "feat: ajouter partage annonce via WhatsApp"
   ```
6. **Poussez** votre branche :
   ```bash
   git push origin feature/partage-annonce-whatsapp
   ```
7. **Ouvrez** une Pull Request sur GitHub avec une description détaillée

### Conventions de commit

| Préfixe | Usage | Exemple |
|---------|-------|---------|
| `feat:` | Nouvelle fonctionnalité | `feat: ajouter partage WhatsApp` |
| `fix:` | Correction de bug | `fix: crash au chargement de la carte` |
| `docs:` | Documentation | `docs: mettre à jour le README` |
| `style:` | Formatage uniquement | `style: indentation composants KYC` |
| `refactor:` | Refactoring | `refactor: simplifier useConversations` |
| `test:` | Tests | `test: ajouter tests unitaires favoris` |
| `chore:` | Maintenance | `chore: mettre à jour expo SDK 55` |
| `i18n:` | Traductions | `i18n: ajouter traductions section alertes` |

### Standards de qualité

- TypeScript strict — zéro `any` implicite
- Aucune donnée mockée — tout doit venir de Supabase
- Chaque texte visible doit être traduit via `useTranslation()`
- Les hooks doivent gérer les états `isLoading` et `error`
- Les actions irréversibles (suppression, rejet) nécessitent une confirmation
- Les uploads de fichiers doivent inclure une compression avant envoi

---

## 📞 Support

Pour toute question, problème technique ou suggestion de fonctionnalité :

| Canal | Contact | Usage |
|-------|---------|-------|
| 📧 Email | support@inzuhub.rw | Support général, questions |
| 🐛 Bug Report | [GitHub Issues](https://github.com/votre-username/InzuHub/issues) | Signalement de bugs |
| 💡 Idées | [GitHub Discussions](https://github.com/votre-username/InzuHub/discussions) | Suggestions de fonctionnalités |

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**.

```
MIT License — Copyright (c) 2026 InzuHub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software.
```

Voir le fichier [LICENSE](LICENSE) pour les termes complets.

---

<div align="center">

**InzuHub** — Fait avec ❤️ pour Gisenyi, Rwanda 🇷🇼

*"Inzu" signifie "maison" en Kinyarwanda*

---

📱 **App Mobile** · React Native + Expo SDK 54 · iOS & Android

🖥️ **Dashboard Admin** · React + Vite + Tailwind CSS

🗄️ **Backend** · Supabase · PostgreSQL + Realtime + Storage + Edge Functions

🌍 **4 langues** · Français · English · Kinyarwanda · Kiswahili

---

### 🌍 La vision en un coup d'œil

```
2026 — v1.0 ✅  Gisenyi, Rwanda
                 └── 1 ville · 4 langues · 2 rôles · KYC · Chat · Visites

2026 — v1.1 🔄  Gisenyi amélioré
                 └── Dark mode · Partage · Comparaison · Stats avancées

2027 — v2.0 🚀  Rwanda national
                 └── Kigali · Musanze · Huye · Mobile Money · Contrats numériques

2028 — v3.0 🌍  Afrique de l'Est
                 └── Burundi · RDC · Ouganda · Tanzanie · IA · B2B Pro

2029 — v4.0 🏦  Super-app immobilière
                 └── FinTech · Artisans · Déménagement · Vente · Marketplace

2030 — v5.0 🌐  Pan-Africaine
                 └── 15 pays · 2M utilisateurs · 15 langues · Series A
```

---

*Digitalisons l'immobilier africain, une ville à la fois.* 🏠🌍

</div>