# 🏠 InzuHub

> **La plateforme de location immobilière de Gisenyi, Rwanda.**
> Trouvez votre logement sans commissionnaire — directement, simplement, en toute confiance.

---

## 📋 Table des Matières

- [À propos du projet](#-à-propos-du-projet)
- [Le problème résolu](#-le-problème-résolu)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture du projet](#-architecture-du-projet)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration Supabase](#-configuration-supabase)
- [Variables d'environnement](#-variables-denvironnement)
- [Lancer le projet](#-lancer-le-projet)
- [Structure des écrans](#-structure-des-écrans)
- [Schéma de base de données](#-schéma-de-base-de-données)
- [Sécurité & RLS](#-sécurité--rls)
- [Contribuer](#-contribuer)
- [Roadmap](#-roadmap)
- [Licence](#-licence)

---

## 🌍 À propos du projet

**InzuHub** est une application mobile développée avec React Native et Expo, spécifiquement conçue pour le marché locatif de la ville de **Gisenyi** (District de Rubavu), à l'ouest du Rwanda, au bord du Lac Kivu.

L'application met en relation directe les **locataires** et les **propriétaires**, en éliminant totalement la dépendance aux commissionnaires (intermédiaires informels) qui caractérise le marché locatif local.

---

## 🔍 Le problème résolu

À Gisenyi, rechercher un logement est un processus long, coûteux et risqué :

| # | Problème | Solution InzuHub |
|---|----------|-----------------|
| 1 | **Commissionnaires obligatoires** — coût + risque financier | Contact direct propriétaire ↔ locataire |
| 2 | **Perte de temps** — visites inutiles, attente de plusieurs jours | Photos obligatoires + infos complètes avant visite |
| 3 | **Manque de transparence** — prix flous, détails incomplets | Fiche technique détaillée avec eau, électricité, équipements |
| 4 | **Pas d'accès direct aux propriétaires** | Chat intégré InzuChat sans intermédiaire |
| 5 | **Marché non digitalisé** — bouche-à-oreille uniquement | Plateforme centralisée avec toutes les offres |
| 6 | **Arnaques et annonces peu fiables** | Système KYC de vérification d'identité + signalements |

---

## ✨ Fonctionnalités

### Pour les Locataires
- 🔍 **Exploration Immobilière** — liste des logements disponibles avec filtres par quartier, prix, équipements
- 🗺️ **Carte des Logements** — vue géographique de Gisenyi avec les points d'intérêt réels (Lac Kivu, marchés, hôpitaux)
- 🏠 **Fiche Détaillée** — galerie photos immersive, caractéristiques techniques, mini-carte, profil propriétaire
- 💬 **InzuChat** — messagerie directe temps réel avec les propriétaires (Supabase Realtime)
- 📅 **Planification de Visite** — sélecteur de date/heure intégré au chat, confirmation formelle

### Pour les Propriétaires
- 📸 **Dépôt d'Annonce** — formulaire en 2 étapes : photos + prix puis localisation + détails
- 🗺️ **Placement sur la Carte** — positionnement précis de la propriété sur la carte de Gisenyi
- 📊 **Tableau de Bord** — gestion des annonces, statuts (Disponible / En discussion / Loué)

### Pour tous les utilisateurs
- 🔐 **Authentification** — inscription/connexion par numéro de téléphone rwandais
- 🪪 **Vérification KYC** — capture guidée de la carte d'identité nationale (Indangamuntu) en 3 étapes
- ✅ **Badge de Confiance** — badge "Identité Vérifiée" visible sur les annonces et le profil
- 🚩 **Signalement** — système de modération participative contre les fausses annonces
- 🔔 **Notifications Push** — rappels automatiques 24h et 2h avant chaque visite confirmée

---

## 🛠️ Stack technique

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework mobile | React Native + Expo | SDK 54 |
| Langage | TypeScript | 5.x |
| Navigation | Expo Router (file-based) | ~6.0 |
| Backend & Auth | Supabase | Latest |
| Base de données | PostgreSQL (via Supabase) | 15 |
| Temps réel | Supabase Realtime | — |
| Stockage fichiers | Supabase Storage | — |
| State Management | Zustand | Latest |
| Carte | react-native-maps | Latest |
| Listes performantes | @shopify/flash-list | Latest |
| Dates | date-fns (locale FR) | Latest |
| Sécurité sessions | expo-secure-store | Latest |
| Notifications | expo-notifications | Latest |
| Image processing | expo-image-manipulator | Latest |
| Camera & Gallery | expo-image-picker | Latest |
| Géolocalisation | expo-location | Latest |

---

## 🗂️ Architecture du projet

```
InzuHub/
├── app/                              # Expo Router — routing file-based
│   ├── (auth)/
│   │   ├── login.tsx                 # Connexion par téléphone
│   │   └── register.tsx             # Inscription (locataire / propriétaire)
│   ├── (app)/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx          # Tab bar personnalisée
│   │   │   ├── index.tsx            # 🏠 Exploration Immobilière
│   │   │   ├── map.tsx              # 🗺️ Carte des Logements
│   │   │   ├── chat.tsx             # 💬 InzuChat — Liste conversations
│   │   │   └── profile.tsx          # 👤 Profil Utilisateur
│   │   ├── property/
│   │   │   └── [id].tsx             # Détails du Logement
│   │   ├── chat/
│   │   │   └── [id].tsx             # Discussion Active (temps réel)
│   │   ├── visite/
│   │   │   └── [id].tsx             # Confirmation de Visite
│   │   └── post/
│   │       ├── media.tsx            # Dépôt Annonce — Photos & Prix
│   │       ├── location.tsx         # Dépôt Annonce — Localisation & Détails
│   │       └── success.tsx          # Écran succès publication
│   ├── kyc.tsx                      # Vérification d'Identité (KYC)
│   └── _layout.tsx                  # Root layout + gestion session
│
├── src/
│   ├── components/
│   │   ├── ui/                      # Composants réutilisables
│   │   │   ├── Button.tsx
│   │   │   ├── InputField.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── QuartierChip.tsx
│   │   │   ├── ReadMoreText.tsx
│   │   │   └── StepperInput.tsx
│   │   ├── property/                # Composants annonces
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PhotoGallery.tsx
│   │   │   ├── FilterModal.tsx
│   │   │   ├── CaracteristiqueItem.tsx
│   │   │   ├── SignalementModal.tsx
│   │   │   └── AnnoncePreview.tsx
│   │   ├── chat/                    # Composants messagerie
│   │   │   ├── ConversationItem.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ChatInputBar.tsx
│   │   │   ├── DateSeparator.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── EmptyStateChat.tsx
│   │   ├── map/                     # Composants carte
│   │   │   ├── PropertyMarker.tsx
│   │   │   ├── POIMarker.tsx
│   │   │   ├── PropertyPreviewPanel.tsx
│   │   │   └── RecenterButton.tsx
│   │   ├── visite/                  # Composants planification
│   │   │   ├── VisiteWidget.tsx
│   │   │   ├── DayCard.tsx
│   │   │   ├── TimeSlot.tsx
│   │   │   └── StepIndicator.tsx
│   │   ├── profile/                 # Composants profil
│   │   │   ├── TrustBadge.tsx
│   │   │   ├── StatsGrid.tsx
│   │   │   ├── MyPropertiesSection.tsx
│   │   │   ├── MyVisitsSection.tsx
│   │   │   └── EditProfileModal.tsx
│   │   ├── kyc/                     # Composants vérification identité
│   │   │   ├── KycStepIndicator.tsx
│   │   │   ├── CaptureFrame.tsx
│   │   │   ├── CaptureOptions.tsx
│   │   │   └── KycStatusScreen.tsx
│   │   └── post/                   # Composants dépôt annonce
│   │       ├── PhotoGrid.tsx
│   │       ├── EquipementToggle.tsx
│   │       ├── QuartierPicker.tsx
│   │       └── MapPickerModal.tsx
│   │
│   ├── hooks/                       # Custom hooks React
│   │   ├── useAuth.ts
│   │   ├── useProperties.ts
│   │   ├── usePropertyDetail.ts
│   │   ├── useMapProperties.ts
│   │   ├── useConversations.ts
│   │   ├── useChat.ts
│   │   ├── useVisitePlanner.ts
│   │   ├── useVisiteDetail.ts
│   │   ├── useProfile.ts
│   │   ├── useKyc.ts
│   │   ├── usePostMedia.ts
│   │   ├── usePostLocation.ts
│   │   └── useLocation.ts
│   │
│   ├── services/                    # Couche d'accès aux données Supabase
│   │   ├── authService.ts
│   │   ├── propertyService.ts
│   │   ├── conversationService.ts
│   │   ├── messageService.ts
│   │   ├── visiteService.ts
│   │   ├── signalementService.ts
│   │   ├── profileService.ts
│   │   ├── kycService.ts
│   │   └── notificationService.ts
│   │
│   ├── store/                       # State management
│   │   ├── AuthContext.tsx          # Session utilisateur
│   │   ├── UnreadContext.tsx        # Badge messages non lus
│   │   └── PostPropertyStore.ts    # Zustand — formulaire annonce
│   │
│   ├── lib/
│   │   └── supabase.ts              # Client Supabase (SecureStore)
│   │
│   ├── types/
│   │   └── database.types.ts        # Types TypeScript complets
│   │
│   ├── constants/
│   │   ├── theme.ts                 # Couleurs, typographie, espacements
│   │   └── gisenyi_poi.ts          # Points d'intérêt de Gisenyi
│   │
│   └── utils/
│       ├── formatters.ts            # Formatage prix RWF, dates, téléphone
│       ├── errorMessages.ts         # Traduction erreurs Supabase → FR
│       └── imageUtils.ts            # Compression et validation d'images
│
├── assets/
│   └── images/
├── .env.local                       # Variables d'environnement (non commité)
├── babel.config.js
├── app.json
├── tsconfig.json
└── package.json
```

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) v18 ou supérieur
- [npm](https://www.npmjs.com/) v9 ou supérieur
- [Expo Go](https://expo.dev/go) sur votre téléphone (iOS ou Android)
- Un compte [Supabase](https://supabase.com/) (gratuit)
- Git

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-username/InzuHub.git
cd InzuHub
```

### 2. Installer les dépendances

```bash
npm install --legacy-peer-deps
```

> ⚠️ Le flag `--legacy-peer-deps` est nécessaire en raison de conflits de peer dependencies entre certains packages Expo SDK 54.

### 3. Installer les dépendances natives Expo

```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
npx expo install expo-secure-store expo-image-picker expo-location expo-camera
npx expo install expo-notifications expo-image-manipulator expo-file-system
npx expo install react-native-maps
npm install @shopify/flash-list date-fns zustand react-native-url-polyfill --legacy-peer-deps
```

---

## 🗄️ Configuration Supabase

### 1. Créer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **Project URL** et votre **anon public key**

### 2. Exécuter le schéma SQL

Dans l'éditeur SQL de votre projet Supabase, exécutez les scripts dans cet ordre :

```sql
-- 1. Activer les extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Créer les tables
-- (voir le fichier /supabase/schema.sql dans le projet)

-- 3. Insérer les quartiers de Gisenyi
INSERT INTO quartiers (nom_quartier) VALUES
  ('Majengo'), ('Mbugangari'), ('Bugoyi'),
  ('Rubavu'), ('Bigogwe'), ('Mudende'),
  ('Rwerere'), ('Nyakiriba'), ('Centre-Ville'), ('Bord du Lac');

-- 4. Activer Row Level Security sur toutes les tables
-- 5. Créer les politiques RLS
-- 6. Créer les triggers automatiques
```

### 3. Créer les buckets Storage

Dans **Storage > New bucket** sur Supabase :

| Nom du bucket | Accès public | Usage |
|---------------|-------------|-------|
| `property-photos` | ✅ Public | Photos des annonces |
| `avatars` | ✅ Public | Photos de profil |
| `kyc-documents` | ❌ Privé | Documents identité KYC |

### 4. Configurer l'authentification

Dans **Authentication > Settings** :
- Désactiver "Confirm email" (les utilisateurs s'inscrivent par téléphone via email fictif)
- Activer les providers nécessaires

---

## 🔑 Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-publique
```

> 🔒 **Important :** Ne commitez jamais ce fichier. Il est déjà dans `.gitignore`.

---

## ▶️ Lancer le projet

### Démarrage standard

```bash
npx expo start --clear
```

### Si vous êtes hors ligne ou derrière un proxy

```bash
npx expo start --clear --offline
```

### Avec tunnel (si réseau local restrictif)

```bash
npx expo start --clear --tunnel
```

Ensuite, scannez le QR code avec :
- **iOS** → l'application Appareil photo
- **Android** → l'application Expo Go

---

## 📱 Structure des écrans

### Parcours Locataire

```
Login / Register
      │
      ▼
🏠 Accueil (Exploration)
   ├── Recherche + Filtres
   ├── Filtre par Quartier
   └── Liste des annonces
         │
         ▼
   🏠 Détails du Logement
      ├── Galerie photos
      ├── Prix + Garantie + Total entrée
      ├── Caractéristiques (eau, électricité...)
      ├── Mini-carte
      ├── Profil propriétaire + Badge Vérifié
      └── [Contacter] → InzuChat
               │
               ▼
         💬 Chat en temps réel
            └── [📅] → Proposer une visite
                        │
                        ▼
                  ✅ Confirmation Visite
                     ├── Countdown
                     ├── Rappels push auto
                     └── Conseils visite

🗺️ Carte des Logements
   ├── Marqueurs de prix sur Gisenyi
   ├── Points d'intérêt (Lac Kivu, marchés...)
   └── Panneau prévisualisation au tap

👤 Profil
   ├── Badge confiance (KYC)
   ├── Mes visites
   └── Paramètres
```

### Parcours Propriétaire

```
👤 Profil → [+ Publier une annonce]
      │
      ▼
📸 Étape 1 — Médias & Prix
   ├── Upload photos (min. 3, max. 10)
   ├── Prix mensuel (RWF)
   ├── Garantie exigée (mois)
   └── Récapitulatif financier
         │
         ▼
📍 Étape 2 — Localisation & Détails
   ├── Titre + Description
   ├── Sélection quartier
   ├── Placement sur la carte (MapPicker)
   ├── Nb chambres + salons
   ├── Équipements (eau, électricité, clôture, parking)
   ├── Aperçu de la carte
   └── [Publier] → 🎉 Succès
```

### Parcours KYC (Vérification d'Identité)

```
👤 Profil → [Vérifier mon identité]
      │
      ▼
🪪 Intro KYC (ce dont vous avez besoin)
      │
      ▼
📷 Étape 1 — Recto carte d'identité
      │
      ▼
📷 Étape 2 — Verso carte d'identité
      │
      ▼
🤳 Étape 3 — Selfie avec la carte
      │
      ▼
✅ Review + Déclaration légale + Soumission
      │
      ▼
⏳ Statut : En attente → Approuvé / Rejeté
   (Supabase Realtime + Notification push)
```

---

## 🗃️ Schéma de base de données

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   utilisateurs  │    │    proprietes   │    │    quartiers    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id_utilisateur  │◄──┐│ id_propriete   │    │ id_quartier     │
│ nom_complet     │   ││ id_utilisateur  │    │ nom_quartier    │
│ numero_telephone│   ││ id_quartier    │───►│                 │
│ role            │   ││ titre          │    └─────────────────┘
│ statut_verif.   │   ││ description    │
│ push_token      │   ││ prix_mensuel   │    ┌─────────────────┐
│ avatar_url      │   ││ garantie       │    │     photos      │
└─────────────────┘   ││ nb_chambres    │    ├─────────────────┤
                      ││ has_eau        │◄──┐│ id_photo        │
┌─────────────────┐   ││ has_electricite│   ││ id_propriete    │
│  conversations  │   ││ statut         │   ││ url_photo       │
├─────────────────┤   ││ latitude       │   ││ est_principale  │
│ id_conversation │   ││ longitude      │   │└─────────────────┘
│ id_locataire    │──┘│ date_publ.     │
│ id_proprietaire │   └─────────────────┘
│ id_propriete    │
│ derniere_activ. │   ┌─────────────────┐    ┌─────────────────┐
└────────┬────────┘   │    messages     │    │    visites      │
         │            ├─────────────────┤    ├─────────────────┤
         └───────────►│ id_message      │    │ id_visite       │
                      │ id_conversation │    │ id_conversation │
                      │ id_expediteur   │    │ date_visite     │
                      │ contenu         │    │ statut          │
                      │ type            │    └─────────────────┘
                      │ lu              │
                      └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│  signalements   │    │  kyc_demandes   │
├─────────────────┤    ├─────────────────┤
│ id_signalement  │    │ id_demande      │
│ id_utilisateur  │    │ id_utilisateur  │
│ id_propriete    │    │ url_recto       │
│ motif           │    │ url_verso       │
│ etat_traitement │    │ url_selfie      │
└─────────────────┘    │ statut          │
                       │ motif_rejet     │
                       └─────────────────┘
```

---

## 🔒 Sécurité & RLS

InzuHub utilise Row Level Security (RLS) de PostgreSQL pour garantir que chaque utilisateur n'accède qu'aux données auxquelles il a droit :

| Table | Lecture | Écriture |
|-------|---------|---------|
| `quartiers` | Tout le monde | Admin seulement |
| `utilisateurs` | Tout le monde (basique) | Propriétaire du compte |
| `proprietes` | Public si `disponible` | Propriétaire de l'annonce |
| `photos` | Tout le monde | Propriétaire de l'annonce |
| `conversations` | Participants uniquement | Locataire (création) |
| `messages` | Participants uniquement | Participants uniquement |
| `visites` | Participants uniquement | Participants uniquement |
| `signalements` | Auteur uniquement | Utilisateur connecté |
| `kyc_demandes` | Propriétaire uniquement | Propriétaire uniquement |

Les **documents KYC** sont stockés dans un bucket **privé** — seule l'équipe InzuHub (admin) peut y accéder pour la vérification.

---

## 🌐 Points d'intérêt de Gisenyi

L'application intègre les vrais points de repère de la ville pour aider les utilisateurs à se localiser :

| POI | Type | Coordonnées |
|-----|------|------------|
| 🌊 Lac Kivu | Nature | -1.7050, 29.2380 |
| 🛒 Marché Central | Commerce | -1.6978, 29.2571 |
| 🏥 Hôpital de Rubavu | Santé | -1.6920, 29.2610 |
| 🎓 Université du Lac Kivu | Éducation | -1.7100, 29.2450 |
| 🚌 Gare Routière | Transport | -1.6995, 29.2590 |
| 🛂 Frontière Petite Barrière | Frontière | -1.6880, 29.2210 |
| 🏨 Serena Hotel | Hôtel | -1.7080, 29.2340 |

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
3. Committez vos changements
   ```bash
   git commit -m "feat: description de la fonctionnalité"
   ```
4. Poussez vers la branche
   ```bash
   git push origin feature/ma-fonctionnalite
   ```
5. Ouvrez une Pull Request

### Conventions de commit

```
feat:     Nouvelle fonctionnalité
fix:      Correction de bug
docs:     Documentation
style:    Formatage (pas de changement logique)
refactor: Refactoring
test:     Ajout de tests
chore:    Maintenance
```

---

## 🗺️ Roadmap

### Version 1.0 (actuelle)
- [x] Authentification par téléphone
- [x] Exploration et carte des logements
- [x] Chat temps réel (InzuChat)
- [x] Planification de visites
- [x] Vérification d'identité KYC
- [x] Dépôt d'annonces avec photos

### Version 1.1 (prochaine)
- [ ] Système de favoris
- [ ] Notifications push pour nouveaux messages
- [ ] Historique des visites passées
- [ ] Filtre avancé par prix min/max sur la carte
- [ ] Mode sombre

### Version 2.0 (futur)
- [ ] Extension à d'autres villes du Rwanda (Kigali, Musanze...)
- [ ] Paiement de caution via Mobile Money (MTN, Airtel)
- [ ] Contrats de location numériques
- [ ] Tableau de bord administrateur
- [ ] Application web (React)

---

## 📞 Support

Pour toute question ou problème :

- 📧 Email : support@inzuhub.rw
- 🐛 Bug report : [Ouvrir une issue GitHub](https://github.com/votre-username/InzuHub/issues)

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

**InzuHub** — Fait avec ❤️ pour Gisenyi, Rwanda 🇷🇼

*"Inzu" signifie "maison" en Kinyarwanda*

</div>