# Guide du projet Erystra Social Desk

## A quoi sert ce projet

Erystra Social Desk est une plateforme interne de gestion des reseaux sociaux pour `Erystra Group`.

Elle sert a centraliser dans une seule interface :

- la connexion des comptes sociaux de l'entreprise
- la creation et la planification des publications
- le suivi des performances marketing
- la generation de rapports PDF ou email
- l'analyse premium assistee par IA

Le projet est pense pour un usage interne, pas pour un modele SaaS multi-client.

## Comment fonctionne le projet

L'application repose sur `Next.js` avec l'`App Router`.

Le fonctionnement global est le suivant :

1. un utilisateur interne se connecte avec son email et son mot de passe
2. l'application verifie la session via un cookie JWT `httpOnly`
3. l'utilisateur accede au tableau de bord et aux modules metier
4. les comptes sociaux peuvent etre connectes via OAuth
5. les publications sont enregistrees en base puis publiees tout de suite ou plus tard
6. un worker peut executer les jobs de publication planifiee et de synchronisation analytics
7. les donnees consolidees servent au dashboard et aux rapports

## Architecture generale

### Frontend et pages

- `app/` contient les pages, layouts et routes API
- `components/` contient les composants reutilisables de l'interface
- `app/(dashboard)/` regroupe les pages internes protegeees

### Backend applicatif

- `lib/auth.ts` gere l'authentification et la session
- `lib/social/` gere OAuth et les fournisseurs sociaux
- `lib/dashboard.ts` consolide les donnees du tableau de bord
- `lib/analytics.ts` gere la synthese et la synchro analytics
- `lib/report-delivery.ts`, `lib/pdf.ts`, `lib/email.ts` gerent les rapports

### Base de donnees

Le projet utilise `Prisma` avec `PostgreSQL`.

Les principales tables sont :

- `User` : utilisateurs internes
- `SocialAccount` : comptes sociaux connectes
- `Post` : publications creees
- `PostPublication` : resultats de publication par canal
- `AnalyticsSnapshot` : captures de statistiques
- `GeneratedReport` : historique des rapports generes

## Fonctionnalites et leur role

### 1. Authentification interne

Role :
securiser l'acces a l'outil et reserver l'application a l'equipe autorisee.

Ce module permet :

- la connexion par email et mot de passe
- la creation d'une session signee
- la deconnexion
- la protection des pages du dashboard

Fichiers cles :

- `lib/auth.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`

### 2. Dashboard

Role :
donner une vue rapide de l'activite social media et des indicateurs utiles.

Le dashboard affiche :

- l'engagement
- la portee
- la croissance des abonnes
- les posts planifies
- les tendances recentes
- les comptes connectes
- les dernieres publications

### 3. Gestion des comptes sociaux

Role :
connecter et administrer les canaux officiels utilises par Erystra.

Le module prend en charge :

- Facebook
- Instagram Business
- LinkedIn
- X

Il gere :

- la redirection OAuth
- le controle du `state`
- le PKCE pour X
- l'echange du code contre un token
- le stockage des informations du compte social

Fichiers cles :

- `lib/social/oauth.ts`
- `lib/social/providers.ts`
- `app/api/social-accounts/connect/route.ts`

### 4. Creation et planification de posts

Role :
permettre a l'equipe marketing de preparer du contenu et de controler son calendrier de diffusion.

Le module permet :

- la creation de publications
- le choix du texte et des medias
- la selection des comptes cibles
- la publication immediate
- la programmation a une date future

### 5. Publication automatisee

Role :
envoyer les contenus vers les plateformes sociales depuis l'application.

Le systeme gere :

- l'appel aux APIs des plateformes
- le suivi du statut de publication
- les erreurs de publication
- l'historique par compte social

### 6. Analytics

Role :
suivre la performance des comptes et produire une lecture exploitable par l'equipe marketing.

Le module analytics couvre :

- les snapshots de statistiques
- la synthese par canal
- la lecture consolidee pour le dashboard
- l'alimentation des rapports

Fichiers cles :

- `lib/analytics.ts`
- `lib/dashboard.ts`
- `app/api/analytics/summary/route.ts`

### 7. Rapports PDF et email

Role :
formaliser la performance social media dans un document diffusable.

Le pipeline de rapport permet :

- de calculer les KPIs
- de generer un rapport
- d'exporter un PDF
- de telecharger le rapport
- d'envoyer le rapport par email

Fichiers cles :

- `lib/report-delivery.ts`
- `lib/pdf.ts`
- `lib/email.ts`
- `app/api/reports/route.ts`

### 8. Analyse premium par IA

Role :
transformer les chiffres en lecture executive et en recommandations.

Cette fonctionnalite peut produire :

- un score global
- un resume dirigeant
- une synthese executive
- des points forts
- des points de vigilance
- des recommandations par canal
- des actions prioritaires

Fichier cle :

- `lib/gemini.ts`

Si la cle IA n'est pas configuree, le projet utilise un fallback plus simple.

### 9. Jobs et automatisation

Role :
faire tourner les traitements periodiques sans intervention manuelle.

Les jobs couvrent :

- la publication des posts planifies
- la synchronisation des analytics

Scripts utiles :

- `npm run jobs:worker`
- `npm run jobs:publish`
- `npm run jobs:analytics`

## Comment utiliser le projet

### Installation

```powershell
npm install
```

### Configuration

1. copier `.env.example` vers `.env`
2. renseigner la base de donnees
3. renseigner `AUTH_SECRET`
4. renseigner les credentials OAuth si tu veux des integrations live
5. renseigner SMTP si tu veux l'envoi des rapports par email
6. renseigner la cle Gemini si tu veux l'analyse IA reelle

### Mise en place de la base

```powershell
npm.cmd exec prisma generate
npm.cmd exec prisma migrate dev --name init
npm run db:seed
```

### Lancement

Dans un terminal :

```powershell
npm run dev
```

Dans un second terminal pour l'automatisation :

```powershell
npm run jobs:worker
```

## Utilisation quotidienne

Workflow type :

1. se connecter a l'application
2. connecter les comptes sociaux
3. creer ou planifier les publications
4. verifier les performances dans le dashboard
5. lancer la synchronisation analytics si besoin
6. generer un rapport PDF ou email

## Dossiers importants

- `app/` : pages et routes API
- `components/` : composants UI
- `lib/` : logique metier
- `prisma/` : schema et migrations
- `scripts/` : seeds, migration et workers
- `storage/reports/` : rapports generes
- `public/` : assets statiques, dont le logo Erystra

## Limites actuelles

- les integrations live dependent de credentials valides
- certaines APIs sociales demandent des permissions avancees
- la qualite des analytics depend des donnees exposees par chaque plateforme
- la qualite du rapport premium depend de la configuration IA et des donnees disponibles

## Resume

Erystra Social Desk est un outil interne de pilotage social media pour connecter les comptes, publier, planifier, suivre les performances et produire des rapports exploitables.
