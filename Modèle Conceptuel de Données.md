### 1. Les Entités Principales et leurs Attributs

**Entité : `Utilisateur**`
Cette entité est cruciale pour contourner les commissionnaires et sécuriser la plateforme.

* `id_utilisateur` (Identifiant unique)
* `nom_complet`
* `numero_telephone` (Essentiel au Rwanda pour le contact rapide et Mobile Money)
* `mot_de_passe` (Crypté)
* `role` (Locataire, Propriétaire, ou Administrateur)
* `statut_verification` (Booléen : *Vrai* si la carte d'identité ou le titre de propriété a été vérifié. Cela résout le **Problème 6 : Risque d'arnaques**).
* `date_inscription`

**Entité : `Propriete` (L'annonce de la maison)**
C'est le cœur de la transparence (Résout le **Problème 3**). Tout doit être clair dès le départ pour éviter les visites inutiles (**Problème 2**).

* `id_propriete`
* `titre` (ex: "Maison 3 chambres avec annexe")
* `description` (Détails précis sur l'eau, l'électricité, la clôture, etc.)
* `prix_mensuel` (Prix exact, fixant ainsi le marché - **Problème 5**)
* `garantie_exigee` (Nombre de mois d'avance)
* `nombre_chambres`
* `nombre_salons`
* `statut` (Disponible, En cours de location, Loué - pour éviter d'appeler pour rien)
* `date_publication`

**Entité : `Quartier**`
Pour structurer la recherche géographiquement à Gisenyi.

* `id_quartier`
* `nom_quartier` (ex: Majengo, Mbugangari, Bugoyi, etc.)

**Entité : `Photo**`
Obligatoire pour garantir la transparence avant toute visite physique.

* `id_photo`
* `url_photo`
* `est_photo_principale` (Booléen)

**Entité : `Signalement**`
Un outil de modération indispensable pour assainir le marché et protéger les utilisateurs.

* `id_signalement`
* `motif` (ex: "Fausse annonce", "Le propriétaire demande de l'argent avant la visite")
* `date_signalement`
* `etat_traitement` (En attente, Résolu, Rejeté)

---

### 2. Les Relations (Associations) et Cardinalités

Voici comment ces informations interagissent entre elles :

* **POSSÉDER / PUBLIER :** Un `Utilisateur` (avec le rôle Propriétaire) peut publier **1 ou plusieurs (1,n)** `Proprietes`. Une `Propriete` est publiée par **un et un seul (1,1)** `Utilisateur`. *Cela garantit qu'on sait toujours exactement à qui appartient l'annonce (fin de l'anonymat des intermédiaires).*
* **SE SITUER :** Une `Propriete` se situe dans **un et un seul (1,1)** `Quartier`. Un `Quartier` peut contenir **0 ou plusieurs (0,n)** `Proprietes`.
* **ILLUSTRER :** Une `Propriete` possède **1 ou plusieurs (1,n)** `Photos` (on peut forcer un minimum de 3 photos dans la logique applicative). Une `Photo` illustre **une et une seule (1,1)** `Propriete`.
* **CONTACTER / METTRE EN RELATION :** Un `Utilisateur` (Locataire) initie **0 ou plusieurs (0,n)** `Conversations` avec un `Utilisateur` (Propriétaire) concernant une `Propriete` spécifique. *C'est ici que s'opère l'accès direct (Problème 4).*
* **SIGNALER :** Un `Utilisateur` peut faire **0 ou plusieurs (0,n)** `Signalements` sur une `Propriete`. Une `Propriete` peut faire l'objet de **0 ou plusieurs (0,n)** `Signalements`.

---

Ce MCD pose des fondations solides. Il empêche structurellement les annonces anonymes, force la transparence via les attributs obligatoires de la propriété et des photos, et intègre la sécurité via la vérification et les signalements.
