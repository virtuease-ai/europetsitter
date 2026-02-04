# 🐾 EuroPetSitter

Plateforme de mise en relation entre propriétaires d'animaux et petsitters en Belgique.

## Stack technique

- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS**  
- **next-intl** (Multilingue FR/NL/EN)
- **Supabase** (Auth + Database)
- **Mapbox** (Cartes)
- **React Hook Form** + **Zod** (Formulaires)

## Démarrage

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement dans `.env.local`

3. Lancer le serveur de développement :
```bash
npm run dev
```

4. Ouvrir [http://localhost:3000/fr](http://localhost:3000/fr)

## Structure

- `/app/[locale]` - Pages multilingues
- `/components` - Composants réutilisables
- `/lib` - Utilitaires et clients
- `/messages` - Fichiers de traduction
- `/hooks` - Hooks personnalisés
- `/types` - Types TypeScript

## Fonctionnalités Phase 1

- ✅ Multilingue (FR/NL/EN)
- ✅ Authentification (Propriétaire/Petsitter)
- ✅ Recherche dynamique avec URLs SEO
- ✅ Profils petsitters publics
- ✅ Dashboard petsitter
- ✅ SEO optimisé

## Base de données Supabase

Voir le fichier PHASE-1-SITE-VITRINE.md pour la structure complète des tables.
