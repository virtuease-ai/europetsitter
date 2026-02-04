etSitter - Documentation Complète

## Vue d'ensemble

La configuration du profil d'un PetSitter est organisée en **3 tabs principaux** (sans compter le tab "Indisponibilités") :

1. **Profil** - Informations générales et présentation
2. **Services** - Types d'animaux et services proposés avec options
3. **Spécificités** - Informations sur le lieu de garde et l'expérience

---

## 📋 TAB 1 : PROFIL

### Description
Ce tab permet au PetSitter de se présenter et de fournir toutes les informations générales sur son activité.

### Champs du formulaire

#### 1. Photo ou logo de profil
- **Type** : Upload d'image
- **Format** : Image ronde (avatar)
- **Label** : "Photo ou logo de votre profil"
- **Visibilité** : Public

#### 2. Galerie photos
- **Type** : Upload multiple d'images
- **Maximum** : 10 photos
- **Label** : "Galerie photos"
- **Description** : "Montrez le lieu de garde (attention aux systèmes de sécurité), la pièce dédiée, le jardin, les aires de promenade, par exemple."
- **Visibilité** : Public

#### 3. Dénomination commerciale / Pseudo
- **Type** : Champ texte
- **Label** : "Dénomination commerciale ou Pseudo (public)"
- **Placeholder** : "Nom de votre entreprise / pseudo"
- **Visibilité** : Public
- **Champ** : `name`

#### 4. Prénom + Nom
- **Type** : Champ texte
- **Label** : "Prénom + Nom (non public)"
- **Placeholder** : "Prénom + nom"
- **Visibilité** : Non public
- **Champ** : `businessName`

#### 5. Adresse postale
- **Type** : Autocomplete avec géolocalisation
- **Label** : "Adresse postale (public)"
- **Aide** : "Sélectionnez une adresse dans la liste des suggestions pour permettre votre localisation sur la carte"
- **Visibilité** : Public
- **Champ** : `address`
- **Données associées** : `coordinates` (latitude, longitude)

#### 6. Numéro de téléphone
- **Type** : Champ téléphone
- **Label** : "Numéro de téléphone (non public)"
- **Placeholder** : "Ex: 06 12 34 56 78"
- **Format** : XX XX XX XX XX (10 chiffres)
- **Validation** : Doit contenir exactement 10 chiffres
- **Message d'erreur** : "Le numéro doit contenir exactement 10 chiffres"
- **Visibilité** : Non public
- **Champ** : `phone`

#### 7. Statut
- **Type** : Select (liste déroulante)
- **Label** : "Statut (public)"
- **Options** :
  - `individual` : "Particulier / Privé"
  - `independent` : "Personne physique / Indépendant"
  - `company` : "Personne morale / Société"
- **Visibilité** : Public
- **Champ** : `businessType`

#### 8. Numéro de TVA (conditionnel)
- **Type** : Champ texte
- **Label** : "Numéro de TVA (obligatoire)"
- **Placeholder** : "FR12345678901"
- **Format** : FR + 11 chiffres
- **Validation** : /^FR\d{11}$/
- **Message d'erreur** : "Le numéro de TVA doit commencer par FR suivi de 11 chiffres"
- **Longueur max** : 13 caractères
- **Visibilité** : Affiché uniquement si `businessType` = `independent` ou `company`
- **Champ** : `tvaNumber`

#### 9. Numéro SIRET (conditionnel)
- **Type** : Champ texte numérique
- **Label** : "Numéro SIRET (obligatoire)"
- **Placeholder** : "12345678901234"
- **Format** : 14 chiffres
- **Aide** : "Le numéro SIRET doit contenir exactement 14 chiffres"
- **Longueur** : Exactement 14 chiffres
- **Visibilité** : Affiché uniquement si `businessType` = `independent` ou `company`
- **Champ** : `siretNumber`

#### 10. Description
- **Type** : Textarea
- **Label** : "Description (public)"
- **Placeholder** : "Expliquez votre activité, décrivez votre vision du métier, votre passion pour nos amis les animaux et attirez à vous une clientèle fidèle !"
- **Lignes** : 4
- **Visibilité** : Public
- **Champ** : `description`

---

## 🐾 TAB 2 : SERVICES

### Description
Ce tab permet au PetSitter de sélectionner les types d'animaux acceptés et les services proposés avec leurs options spécifiques et tarifs.

### Section 1 : Types d'animaux acceptés

**Label** : "Types d'animaux acceptés"

**Type** : Sélection multiple (checkboxes avec images)

**Liste des animaux** :
- `petit-chien` : "Petit Chien (-10kg)"
- `moyen-chien` : "Moyen chien (10-20kg)"
- `grand-chien` : "Grand chien (+20kg)"
- `chien-attaque` : "Chien d'attaque (Cat. 1)"
- `chien-garde` : "Chien de garde (Cat. 2)"
- `chat` : "Chat"
- `lapin` : "Lapin"
- `rongeur` : "Petit rongeur"
- `oiseau` : "Oiseau"
- `volaille` : "Volaille"
- `nac` : "NAC (Nouveaux Animaux de Compagnie)"

**Champ** : `animals` (array)

---

### Section 2 : Services proposés

**Label** : "Services proposés"

Chaque service peut être activé/désactivé individuellement et possède :
- Une checkbox pour activer/désactiver le service
- Des champs de prix (jour/semaine) si applicable
- Une description du service
- Des **options spécifiques** selon le service et les animaux sélectionnés

---

#### Service 1 : Hébergement

**ID** : `hebergement`  
**Label** : "Hébergement (garde de +12h)"  
**Tarification** : Oui

**Champs** :
- `price` : Prix/jour (€)
- `priceWeek` : Prix/semaine (€)
- `description` : Description du service

**Options pour CHIENS** (si au moins un chien est sélectionné) :

Sous-catégorie : `hebergementChien`

1. `ext-espace-privatif` : "En extérieur dans un espace privatif clos (chenil)"
2. `partage-sans-acces` : "Partage l'espace de vie sans accès à un espace extérieur clos"
3. `partage-avec-acces` : "Partage l'espace de vie avec accès à un espace clos extérieur (cour ou jardin)"
4. `int-sans-acces` : "En intérieur dans une pièce dédiée sans accès à un espace extérieur clos"
5. `int-avec-acces` : "En intérieur dans une pièce dédiée avec accès à un espace extérieur clos (cour ou jardin)"

**Options pour CHATS** (si chat est sélectionné) :

Sous-catégorie : `hebergementChat`

1. `chat-partage-sans-acces` : "Partage l'espace de vie sans accès à un espace extérieur clos"
2. `chat-partage-avec-acces` : "Partage l'espace de vie avec accès à un espace clos extérieur (cour ou jardin)"
3. `chat-int-sans-acces` : "En intérieur dans une pièce dédiée sans accès à un espace extérieur clos"
4. `chat-int-avec-acces` : "En intérieur dans une pièce dédiée avec accès à un espace extérieur clos (cour ou jardin)"

---

#### Service 2 : Garde

**ID** : `garde`  
**Label** : "Garde (garde de -12h)"  
**Tarification** : Oui

**Champs** :
- `price` : Prix/jour (€)
- `priceWeek` : Prix/semaine (€)
- `description` : Description du service

**Options pour CHIENS** (si au moins un chien est sélectionné) :

Sous-catégorie : `gardeChien`

1. `garde-partage-sans-acces` : "Partage l'espace de vie sans accès à un espace extérieur clos"
2. `garde-partage-avec-acces` : "Partage l'espace de vie avec accès à un espace clos extérieur (cour ou jardin)"
3. `garde-int-sans-acces` : "En intérieur dans une pièce dédiée sans accès à un espace extérieur clos"
4. `garde-int-avec-acces` : "En intérieur dans une pièce dédiée avec accès à un espace extérieur clos (cour ou jardin)"

**Options pour CHATS** (si chat est sélectionné) :

Sous-catégorie : `gardeChat`

1. `chat-garde-partage-sans-acces` : "Partage l'espace de vie sans accès à un espace extérieur clos"
2. `chat-garde-partage-avec-acces` : "Partage l'espace de vie avec accès à un espace clos extérieur (cour ou jardin)"
3. `chat-garde-int-sans-acces` : "En intérieur dans une pièce dédiée sans accès à un espace extérieur clos"
4. `chat-garde-int-avec-acces` : "En intérieur dans une pièce dédiée avec accès à un espace extérieur clos (cour ou jardin)"

---

#### Service 3 : Visite

**ID** : `visite`  
**Label** : "Visite sur le lieu de vie de l'animal"  
**Tarification** : Oui

**Champs** :
- `price` : Prix/jour (€)
- `priceWeek` : Prix/semaine (€)
- `description` : Description du service

**Options pour CHIENS** (si au moins un chien est sélectionné) :

Sous-catégorie : `visiteChien`

1. `1-visite` : "1x visite à domicile par jour + nourrissage"
2. `2-visites` : "2x visite à domicile par jour + nourrissage"
3. `1-visite-1-promenade` : "1x visite à domicile par jour + 1x promenade du chien + nourrissage"
4. `2-visites-2-promenades` : "2x visites à domicile par jour + 2x promenade du chien + nourrissage"

**Options pour CHATS** (si chat est sélectionné) :

Sous-catégorie : `visiteChat`

1. `chat-1-visite` : "1x visite à domicile par jour + nourrissage"
2. `chat-2-visites` : "2x visites à domicile par jour + nourrissage"

---

#### Service 4 : Promenade

**ID** : `promenade`  
**Label** : "Chien en promenade"  
**Tarification** : Oui

**Champs** :
- `price` : Prix/jour (€)
- `priceWeek` : Prix/semaine (€)
- `description` : Description du service

**Options pour CHIENS** (si au moins un chien est sélectionné) :

Sous-catégorie : `promenadeChien`

1. `promenade-1x` : "Promenade du chien 1x par jour"
2. `promenade-2x` : "Promenade du chien 2x par jour"

---

#### Service 5 : Excursion

**ID** : `excursion`  
**Label** : "Chien en excursion"  
**Tarification** : Non

**Champs** :
- `description` : Description du service

**Options** : Aucune option spécifique

---

### Structure de données pour les services

```javascript
services: {
  animals: ['petit-chien', 'chat', ...],  // Array des IDs d'animaux
  services: [
    {
      type: 'hebergement',
      price: '25',
      priceWeek: '150',
      description: 'Hébergement dans un cadre familial...'
    },
    // ... autres services
  ],
  serviceOptions: {
    hebergementChien: ['partage-avec-acces', 'int-avec-acces'],
    visiteChien: ['1-visite-1-promenade'],
    promenadeChien: ['promenade-2x'],
    hebergementChat: ['chat-partage-avec-acces'],
    visiteChat: ['chat-1-visite'],
    gardeChien: [],
    gardeChat: []
  }
}
```

---

## 🏡 TAB 3 : SPÉCIFICITÉS

### Description
Ce tab permet au PetSitter de préciser les caractéristiques de son lieu de garde et son expérience.

---

### Section 1 : Type du lieu de l'hébergement

**Titre** : "Type du lieu de l'hébergement"  
**Sous-titre** : "Sélectionnez le type de votre habitation"  
**Type** : Sélection unique (radio buttons)

**Options** :
- `maison` : "Maison"
- `appartement` : "Appartement"
- `propriete` : "Propriété à la campagne"

**Champ** : `specificities.housingType`

---

### Section 2 : Enfants

**Titre** : "Enfants"  
**Sous-titre** : "Présence d'enfants sur le lieu de garde"  
**Type** : Sélection unique (radio buttons)

**Options** :
- `no-answer` : "Je ne réponds pas à cette question"
- `no-children` : "Pas d'enfants"
- `toddlers` : "Bambins à la maison (-6 ans)"
- `children` : "Enfants à la maison (6-12 ans)"
- `teenagers` : "Adolescents à la maison (+12 ans)"

**Champ** : `specificities.children`

---

### Section 3 : Lieux de promenade

**Titre** : "Lieux de promenade"  
**Sous-titre** : "Type d'aires de promenade près du lieu de garde"  
**Description** : "Sélectionnez les zones de promenade disponibles près de chez vous"  
**Type** : Sélection multiple (checkboxes)

**Options** :
- `off-leash` : "Zone sans laisse à proximité"
- `park` : "Parc"
- `beach` : "Plage"
- `forest` : "Forêt"
- `countryside` : "Campagne"

**Champ** : `specificities.walkingAreas` (array)

---

### Section 4 : Compétences supplémentaires

**Titre** : "Compétences supplémentaires"  
**Sous-titre** : "Vos autres domaines de compétence"  
**Description** : "Indiquez les domaines dans lesquels vous avez une expertise"  
**Type** : Sélection multiple (checkboxes)

**Options** :
- `volunteer` : "Expérience en tant que bénévole dans le domaine du bien-être animal"
- `behavior` : "Expérience avec les problèmes de comportement"
- `rescue` : "Expérience avec des animaux de sauvetage"
- `training` : "Expérience avec les techniques de dressage de chien"

**Champ** : `specificities.experience` (array)

---

### Section 5 : Années d'expérience

**Titre** : "Années d'expérience"  
**Sous-titre** : "Votre niveau d'expérience"  
**Description** : "Indiquez votre niveau d'expérience avec les animaux"  
**Type** : Sélection unique (radio buttons)

**Options** :
- `less-1` : "Moins de 1 an d'expérience"
- `less-5` : "Moins de 5 ans d'expérience"
- `more-5` : "Plus de 5 ans d'expérience"
- `more-10` : "Plus de 10 ans d'expérience"

**Champ** : `specificities.yearsOfExperience`

---

### Structure de données pour les spécificités

```javascript
specificities: {
  housingType: 'maison',           // string (sélection unique)
  children: 'no-children',         // string (sélection unique)
  walkingAreas: ['park', 'forest'], // array (sélection multiple)
  experience: ['volunteer', 'training'], // array (sélection multiple)
  yearsOfExperience: 'more-5'      // string (sélection unique)
}
```

---

## 📊 STRUCTURE COMPLÈTE DES DONNÉES

### Vue d'ensemble de toutes les données du profil

```javascript
{
  // TAB 1 : PROFIL
  profile: {
    avatar: 'https://...',              // URL de l'image
    photos: ['url1', 'url2', ...],      // Array d'URLs (max 10)
    name: 'Mon PetSitting',             // Dénomination commerciale/Pseudo
    businessName: 'Jean Dupont',        // Prénom + Nom
    address: '123 Rue Example, Paris',  // Adresse complète
    coordinates: {
      latitude: 48.8566,
      longitude: 2.3522
    },
    phone: '0612345678',                // 10 chiffres
    businessType: 'individual',         // 'individual' | 'independent' | 'company'
    tvaNumber: 'FR12345678901',        // Si businessType !== 'individual'
    siretNumber: '12345678901234',     // Si businessType !== 'individual'
    description: 'Description complète...'
  },

  // TAB 2 : SERVICES
  services: {
    animals: [
      'petit-chien',
      'moyen-chien',
      'grand-chien',
      'chien-attaque',
      'chien-garde',
      'chat',
      'lapin',
      'rongeur',
      'oiseau',
      'volaille',
      'nac'
    ],
    services: [
      {
        type: 'hebergement',           // 'hebergement' | 'garde' | 'visite' | 'promenade' | 'excursion'
        price: '25',                    // Prix/jour
        priceWeek: '150',              // Prix/semaine (optionnel pour excursion)
        description: 'Description...'
      }
      // ... autres services
    ],
    serviceOptions: {
      hebergementChien: [
        'ext-espace-privatif',
        'partage-sans-acces',
        'partage-avec-acces',
        'int-sans-acces',
        'int-avec-acces'
      ],
      gardeChien: [
        'garde-partage-sans-acces',
        'garde-partage-avec-acces',
        'garde-int-sans-acces',
        'garde-int-avec-acces'
      ],
      visiteChien: [
        '1-visite',
        '2-visites',
        '1-visite-1-promenade',
        '2-visites-2-promenades'
      ],
      promenadeChien: [
        'promenade-1x',
        'promenade-2x'
      ],
      hebergementChat: [
        'chat-partage-sans-acces',
        'chat-partage-avec-acces',
        'chat-int-sans-acces',
        'chat-int-avec-acces'
      ],
      gardeChat: [
        'chat-garde-partage-sans-acces',
        'chat-garde-partage-avec-acces',
        'chat-garde-int-sans-acces',
        'chat-garde-int-avec-acces'
      ],
      visiteChat: [
        'chat-1-visite',
        'chat-2-visites'
      ]
    }
  },

  // TAB 3 : SPÉCIFICITÉS
  specificities: {
    housingType: 'maison',             // 'maison' | 'appartement' | 'propriete'
    children: 'no-children',           // 'no-answer' | 'no-children' | 'toddlers' | 'children' | 'teenagers'
    walkingAreas: [                    // array (sélection multiple)
      'off-leash',
      'park',
      'beach',
      'forest',
      'countryside'
    ],
    experience: [                      // array (sélection multiple)
      'volunteer',
      'behavior',
      'rescue',
      'training'
    ],
    yearsOfExperience: 'more-5'       // 'less-1' | 'less-5' | 'more-5' | 'more-10'
  }
}
```

---

## 🔄 LOGIQUE CONDITIONNELLE

### Affichage conditionnel des champs

#### Tab 1 : Profil

**Numéro de TVA et SIRET** :
- S'affichent uniquement si `businessType === 'independent'` OU `businessType === 'company'`
- Si l'utilisateur change `businessType` à `'individual'`, les champs `tvaNumber` et `siretNumber` sont réinitialisés (vides)
- Ces champs sont **obligatoires** pour les statuts `independent` et `company`

#### Tab 2 : Services

**Options des services** :
- Les options pour **CHIENS** s'affichent uniquement si au moins un type de chien est sélectionné dans `animals` :
  - Types de chiens : `petit-chien`, `moyen-chien`, `grand-chien`, `chien-attaque`, `chien-garde`
- Les options pour **CHATS** s'affichent uniquement si `chat` est sélectionné dans `animals`

**Tarification** :
- Les services `hebergement`, `garde`, `visite`, `promenade` ont des champs de tarification (prix/jour et prix/semaine)
- Le service `excursion` n'a **pas** de champs de tarification

**Affichage des options** :
- Les options spécifiques d'un service s'affichent uniquement si le service est activé (checkbox cochée)
- Exemple : Les options d'hébergement pour chiens ne s'affichent que si :
  1. Le service "Hébergement" est coché
  2. Au moins un type de chien est sélectionné

---

## 🎨 COMPORTEMENTS UI/UX

### Navigation entre les tabs

- **4 tabs** au total : Profil, Services, Spécificités, Indisponibilités (non détaillé ici)
- Navigation possible via :
  - Clic direct sur un tab (barre de navigation en haut)
  - Boutons "Suivant" / "Retour" en bas du formulaire
- Les tabs sont toujours accessibles (pas de verrouillage séquentiel)

### Boutons d'action

#### Bouton "Enregistrer" (Save)
- S'affiche uniquement si des modifications ont été détectées
- Couleur : Rouge (mise en évidence)
- Permet de sauvegarder sans changer de tab
- Label : "Enregistrer" / "Enregistrement..." (pendant l'action)

#### Bouton "Suivant" (Next)
- Présent sur tous les tabs sauf le dernier
- Sauvegarde ET passe au tab suivant
- Label : "Suivant"

#### Bouton "Publier" (Publish)
- Présent uniquement sur le dernier tab (Indisponibilités)
- Sauvegarde et publie le profil
- Label : "Publier"

#### Bouton "Retour" (Back)
- Présent sur tous les tabs sauf le premier
- Revient au tab précédent sans sauvegarder
- Label : "Retour"

### Validation des champs

#### Téléphone
- Format automatique : XX XX XX XX XX
- Validation en temps réel
- Message d'erreur si différent de 10 chiffres
- Bordure rouge si invalide

#### Numéro de TVA
- Préfixe automatique "FR"
- Validation en temps réel : /^FR\d{11}$/
- Message d'erreur si format invalide
- Bordure rouge si invalide

#### SIRET
- Accepte uniquement les chiffres
- Maximum 14 chiffres
- Validation en temps réel

#### Adresse
- Autocomplete avec suggestions
- Doit être sélectionnée dans la liste pour obtenir les coordonnées GPS
- Message d'aide pour guider l'utilisateur

### Détection des modifications

Le système détecte automatiquement si des modifications ont été apportées :
- Compare les données du formulaire avec les données initiales
- Affiche le bouton "Enregistrer" si `hasChanges === true`
- Empêche la navigation accidentelle si des modifications non sauvegardées existent

---

## 📝 MESSAGES ET TRADUCTIONS

### Messages de succès
- **Enregistrement** : "Modifications enregistrées avec succès !"
- **Publication** : "Votre profil a été publié avec succès !"

### Messages d'erreur
- **Enregistrement** : "Une erreur est survenue lors de l'enregistrement des modifications."
- **Publication** : "Une erreur est survenue lors de la publication de votre profil:"
- **Téléphone** : "Le numéro doit contenir exactement 10 chiffres"
- **TVA** : "Le numéro de TVA doit commencer par FR suivi de 11 chiffres"
- **SIRET** : "Le numéro SIRET doit contenir exactement 14 chiffres"

### Aide contextuelle
- **Adresse** : "Sélectionnez une adresse dans la liste des suggestions pour permettre votre localisation sur la carte"
- **SIRET** : "Le numéro SIRET doit contenir exactement 14 chiffres"
- **Galerie** : "Montrez le lieu de garde (attention aux systèmes de sécurité), la pièce dédiée, le jardin, les aires de promenade, par exemple."

---

## 🔧 COMPOSANTS UTILISÉS

### Composants principaux

1. **ImageUpload**
   - Upload d'image unique avec prévisualisation
   - Support du format rond pour l'avatar
   - Gestion des erreurs d'upload

2. **PhotoGallery**
   - Upload multiple d'images (max 10)
   - Prévisualisation avec possibilité de suppression
   - Réorganisation par glisser-déposer

3. **AddressAutocomplete**
   - Autocomplete avec API de géolocalisation
   - Retourne l'adresse ET les coordonnées GPS
   - Suggestions en temps réel

4. **AnimalTypeSelector**
   - Sélection multiple avec checkboxes
   - Interface visuelle avec icônes d'animaux
   - Support des traductions

5. **ServiceOptionsSelector**
   - Sélection multiple ou unique selon la configuration
   - Interface avec checkboxes ou radio buttons
   - Titre et description personnalisables
   - Paramètre `multiple` : true/false

---

## 💾 SAUVEGARDE DES DONNÉES

### Méthode de sauvegarde

Lors de la sauvegarde, toutes les données des 3 tabs sont combinées et envoyées :

```javascript
const profileToSave = {
  // Données du Tab 1 (spread)
  ...formData.profile,
  
  // Données du Tab 2
  services: formData.services.services,
  animals: formData.services.animals,
  serviceOptions: formData.services.serviceOptions,
  
  // Données du Tab 3
  specificities: formData.specificities,
  
  // Données d'adresse (duplication pour compatibilité)
  location: formData.profile.address,
  coordinates: formData.profile.coordinates,
  
  // Tab 4 (non détaillé ici)
  availability: formData.availability.general,
  blockedDates: formData.availability.blockedDates
};
```

### LocalStorage

Les données sont automatiquement sauvegardées dans le localStorage à chaque modification :
- Clé : `profile-data-${userId}`
- Permet de restaurer les données en cas de fermeture accidentelle
- Synchronisé avec l'état du formulaire

---

## 🎯 POINTS CLÉS POUR LA RECRÉATION

### Ordre de développement recommandé

1. **Créer la structure des tabs** avec navigation
2. **Implémenter le Tab 1 (Profil)** avec tous les champs
3. **Implémenter le Tab 2 (Services)** avec la logique conditionnelle
4. **Implémenter le Tab 3 (Spécificités)** avec les sélections
5. **Ajouter la détection des modifications**
6. **Implémenter les boutons de navigation et sauvegarde**
7. **Ajouter les validations de champs**
8. **Tester la logique conditionnelle complète**

### Fonctionnalités essentielles à ne pas oublier

✅ **Affichage conditionnel** : TVA/SIRET selon le statut  
✅ **Affichage conditionnel** : Options de services selon les animaux sélectionnés  
✅ **Validation en temps réel** : Téléphone, TVA, SIRET  
✅ **Formatage automatique** : Téléphone (espaces), TVA (préfixe FR)  
✅ **Détection des modifications** : Bouton "Enregistrer" conditionnel  
✅ **Navigation fluide** : Boutons Suivant/Retour/Enregistrer/Publier  
✅ **Messages clairs** : Succès, erreurs, aide contextuelle  
✅ **Sauvegarde locale** : LocalStorage pour éviter la perte de données  
✅ **Géolocalisation** : Coordonnées GPS depuis l'adresse  
✅ **Upload d'images** : Avatar + Galerie (max 10)

---

## 📚 RÉSUMÉ VISUEL

```
┌─────────────────────────────────────────────────────────────┐
│                    PROFIL PETSITTER                         │
├─────────────────────────────────────────────────────────────┤
│  [Profil] [Services] [Spécificités] [Indisponibilités]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TAB 1: PROFIL                                              │
│  ├── Avatar (image ronde)                                   │
│  ├── Galerie photos (max 10)                                │
│  ├── Dénomination/Pseudo                                    │
│  ├── Prénom + Nom                                           │
│  ├── Adresse (avec géolocalisation)                         │
│  ├── Téléphone (format XX XX XX XX XX)                      │
│  ├── Statut (Particulier/Indépendant/Société)              │
│  ├── [Si pro] Numéro TVA (FR + 11 chiffres)                │
│  ├── [Si pro] Numéro SIRET (14 chiffres)                   │
│  └── Description                                            │
│                                                             │
│  TAB 2: SERVICES                                            │
│  ├── Types d'animaux (sélection multiple)                  │
│  │   └── 11 types disponibles                              │
│  └── Services proposés                                      │
│      ├── Hébergement (+12h) + prix                         │
│      │   ├── [Si chiens] 5 options                         │
│      │   └── [Si chats] 4 options                          │
│      ├── Garde (-12h) + prix                               │
│      │   ├── [Si chiens] 4 options                         │
│      │   └── [Si chats] 4 options                          │
│      ├── Visite + prix                                     │
│      │   ├── [Si chiens] 4 options                         │
│      │   └── [Si chats] 2 options                          │
│      ├── Promenade + prix                                  │
│      │   └── [Si chiens] 2 options                         │
│      └── Excursion (sans prix)                             │
│                                                             │
│  TAB 3: SPÉCIFICITÉS                                        │
│  ├── Type de logement (sélection unique)                   │
│  │   └── 3 options                                          │
│  ├── Enfants (sélection unique)                            │
│  │   └── 5 options                                          │
│  ├── Lieux de promenade (sélection multiple)               │
│  │   └── 5 options                                          │
│  ├── Compétences supplémentaires (sélection multiple)      │
│  │   └── 4 options                                          │
│  └── Années d'expérience (sélection unique)                │
│      └── 4 options                                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [◄ Retour]              [💾 Enregistrer] [Suivant ►]      │
└─────────────────────────────────────────────────────────────┘
```

---

**FIN DE LA DOCUMENTATION**