# Erystra Social Desk

Plateforme interne de gestion des reseaux sociaux pour Erystra Group.

Erystra Social Desk est un derive moderne de Socioboard, repense pour un usage mono-entreprise, avec une architecture simple, maintenable et orientee execution marketing.

## Objectif

Le projet remplace la complexite SaaS historique de Socioboard par une plateforme interne focalisee sur :

- connexion des comptes sociaux
- publication et planification
- analytics utiles a l'equipe marketing
- rapports PDF et email
- analyse premium assistee par Gemini

## Positionnement

Ce projet n'est pas un SaaS public.

Il est concu pour :

- une seule entreprise
- une equipe marketing interne
- un pilotage simple et professionnel
- une maintenance faible
- une dette technique maitrisee

## Branding Erystra

- Entreprise : `Erystra Group`
- Signature : `Ensemble, faconnons un avenir prospere, resilient et durable`
- Vision : `Catalyseur de developpement durable via transformation des organisations`
- Mission : `Developper talents et organisations avec des solutions innovantes et durables`
- Valeurs : `Innovation`, `Probite`, `Excellence`, `Durabilite`, `Transparence`

## Stack technique

- `Next.js` App Router
- `React`
- `TypeScript`
- `Prisma ORM`
- `PostgreSQL / Neon`
- `JWT httpOnly cookies`
- `node-cron` pour les jobs
- `nodemailer` pour l'envoi email
- `Gemini API` pour l'analyse premium

## Fonctionnalites

### Fonctionnalites coeur

- authentification interne simple
- connexion OAuth des comptes sociaux
- gestion des comptes Facebook, LinkedIn, X, Instagram
- creation de posts
- publication immediate ou planifiee
- historique des publications
- dashboard marketing
- analytics de base
- rapports PDF telechargeables
- rapports email
- analyse IA premium avec Gemini

### Fonctionnalites analytics

- reach cumule
- engagement cumule
- croissance des abonnes
- repartition par canal
- synthese de performance exploitable

### Fonctionnalites IA premium

Chaque rapport premium peut inclure :

- score global de performance
- resume dirigeant
- synthese executive
- points forts
- points de vigilance
- recommandations par canal
- actions prioritaires
- synthese narrative Gemini

## Architecture

```text
erystra-social-next/
├─ app/
│  ├─ (dashboard)/
│  │  ├─ page.tsx
│  │  ├─ accounts/page.tsx
│  │  ├─ posts/page.tsx
│  │  ├─ planner/page.tsx
│  │  ├─ analytics/page.tsx
│  │  └─ reports/page.tsx
│  ├─ api/
│  │  ├─ auth/
│  │  ├─ dashboard/
│  │  ├─ jobs/
│  │  ├─ posts/
│  │  ├─ reports/
│  │  ├─ schedule/
│  │  └─ social-accounts/
│  ├─ login/
│  ├─ globals.css
│  └─ layout.tsx
├─ components/
├─ lib/
│  ├─ social/
│  ├─ analytics.ts
│  ├─ auth.ts
│  ├─ email.ts
│  ├─ gemini.ts
│  ├─ pdf.ts
│  ├─ report-delivery.ts
│  └─ scheduler.ts
├─ prisma/
│  ├─ migrations/
│  └─ schema.prisma
├─ scripts/
│  ├─ seed.ts
│  ├─ migrate-legacy.ts
│  └─ workers/
├─ storage/
│  └─ reports/
└─ types/
```

## Modele de donnees

Le schema Prisma couvre :

- `User`
- `SocialAccount`
- `Post`
- `PostPublication`
- `AnalyticsSnapshot`
- `GeneratedReport`

Migration initiale creee :

- `prisma/migrations/20260406152942_first/migration.sql`

## Prerequis

- `Node.js 20+`
- `npm 10+`
- une base `PostgreSQL` ou `Neon`
- credentials OAuth des plateformes sociales si tu veux les integrations live
- credentials SMTP si tu veux l'envoi par email
- une cle `Gemini API` si tu veux l'analyse IA live

## Installation

Depuis le dossier du projet :

```powershell
cd C:\Users\Young Vic\Downloads\Socioboard-5.0-master\Socioboard-5.0-master\erystra-social-next
npm install
```

## Configuration

Copie le fichier d'exemple :

```powershell
Copy-Item .env.example .env
```

Puis renseigne les variables.

### Variables essentielles

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH_SECRET="..."
APP_URL="http://localhost:3000"
SEED_ADMIN_EMAIL="marketing@erystra-group.com"
SEED_ADMIN_PASSWORD="..."
```

### Variables OAuth

```env
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
FACEBOOK_GRAPH_VERSION="v23.0"
FACEBOOK_REDIRECT_URI="http://localhost:3000/api/social-accounts/connect?provider=FACEBOOK"

INSTAGRAM_CLIENT_ID=""
INSTAGRAM_CLIENT_SECRET=""
INSTAGRAM_REDIRECT_URI="http://localhost:3000/api/social-accounts/connect?provider=INSTAGRAM"

LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""
LINKEDIN_REDIRECT_URI="http://localhost:3000/api/social-accounts/connect?provider=LINKEDIN"

TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""
TWITTER_REDIRECT_URI="http://localhost:3000/api/social-accounts/connect?provider=TWITTER"
```

### Variables email

```env
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="noreply@erystra-group.com"
```

### Variables jobs et IA

```env
JOBS_SECRET="change-me-job-secret"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash"
```

## Prisma

### Generer le client

```powershell
npm.cmd exec prisma generate
```

### Creer / appliquer les migrations

```powershell
npm.cmd exec prisma migrate dev --name init
```

### Seeder la base

```powershell
npm run db:seed
```

Le seed cree :

- un utilisateur admin
- plusieurs comptes sociaux de demo
- un post planifie
- des snapshots analytics de demo

## Lancer le projet

### Serveur web

```powershell
npm run dev
```

### Worker cron

Dans un second terminal :

```powershell
npm run jobs:worker
```

Le worker gere :

- publication des posts planifies
- synchronisation periodique des analytics

## Scripts disponibles

```powershell
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run migrate:legacy
npm run jobs:worker
npm run jobs:publish
npm run jobs:analytics
```

## Authentification

Le projet utilise :

- login interne par email + mot de passe
- session JWT signee
- cookie httpOnly

Fichiers principaux :

- `lib/auth.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`

## Connexion des comptes sociaux

Le module social gere :

- generation des URLs OAuth
- validation du `state`
- PKCE pour X
- echange code -> token
- persistence des tokens dans la base

Fichiers principaux :

- `lib/social/oauth.ts`
- `lib/social/providers.ts`
- `app/api/social-accounts/connect/route.ts`

## Publication reelle vers les reseaux sociaux

Publication actuellement structuree pour :

- Facebook Pages
- Instagram Business
- LinkedIn
- X

Les adaptateurs sont centralises dans :

- `lib/social/providers.ts`

## Analytics

Le systeme stocke des snapshots dans `AnalyticsSnapshot`.

Jobs disponibles :

- synchronisation analytics
- calcul de synthese dashboard
- lecture agregee pour rapport

Fichiers principaux :

- `lib/analytics.ts`
- `lib/dashboard.ts`
- `app/api/analytics/summary/route.ts`

## Rapports PDF et email

Le pipeline de rapport :

1. collecte les KPIs
2. genere l'analyse premium Gemini
3. cree le PDF
4. stocke le fichier dans `storage/reports`
5. permet le telechargement
6. peut envoyer le rapport par email

Fichiers principaux :

- `lib/report-delivery.ts`
- `lib/pdf.ts`
- `lib/email.ts`
- `app/api/reports/route.ts`
- `app/api/reports/[id]/download/route.ts`

## Rapport premium Gemini

Le mode premium produit une structure exploitable management avec :

- `overallScore`
- `boardSummary`
- `executiveSummary`
- `keyWins`
- `watchouts`
- `channelRecommendations`
- `nextActions`
- `rawText`

Fichiers principaux :

- `lib/gemini.ts`
- `types/report.ts`

Si `GEMINI_API_KEY` est absente, un fallback premium deterministic est utilise.

## Jobs

### Worker cron

- publication planifiee : toutes les 2 minutes
- synchronisation analytics : toutes les heures

Fichier :

- `scripts/workers/cron.ts`

### Jobs one-shot

```powershell
npm run jobs:publish
npm run jobs:analytics
```

## Migration depuis le legacy Socioboard

Un script de migration initiale est disponible :

```powershell
npm run migrate:legacy
```

Ce script migre principalement :

- utilisateurs legacy
- comptes sociaux legacy
- schedules SQL legacy

Fichier :

- `scripts/migrate-legacy.ts`

## Dossiers importants

### `storage/`

Dossier runtime pour les artefacts generes :

- PDF de rapports
- fichiers temporaires de sortie

Des `.gitkeep` sont presents pour conserver la structure.

### `types/`

Dossier des types partages applicatifs :

- analytics
- social
- reporting premium

## Limites actuelles

- les integrations sociales reelles dependent de credentials OAuth valides
- certaines APIs sociales exigent des permissions avancees ou une app approuvee
- les analytics provider restent inegales selon les APIs accessibles
- le generateur PDF est volontairement simple et robuste, pas un moteur editorial complexe

## Workflow recommande

1. configurer `.env`
2. lancer Prisma
3. lancer le seed
4. demarrer l'app
5. demarrer le worker
6. connecter les comptes sociaux
7. publier et planifier
8. generer les rapports premium PDF

## Sources officielles utiles

- Meta Facebook Login: `https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/`
- Meta Pages API posts: `https://developers.facebook.com/docs/pages-api/posts/`
- Meta Instagram content publishing: `https://developers.facebook.com/docs/instagram-api/guides/content-publishing/`
- LinkedIn Posts API: `https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/`
- X OAuth 2.0 PKCE: `https://docs.x.com/resources/fundamentals/authentication/oauth-2-0/user-access-token`
- X create post: `https://docs.x.com/x-api/posts/create-post`
- Gemini API: `https://ai.google.dev/`

## Licence / usage

Ce projet est un socle interne Erystra Group construit a partir d'une refonte du legacy Socioboard. Adapte-le selon tes besoins internes, politiques de securite et contraintes d'integration.
