# Refactor cible Erystra Social Desk

## Ce qui est garde

- Connexion interne simple
- Connexion de comptes sociaux
- Publication immediate ou planifiee
- Historique des posts
- Analytics simples: engagement, reach, croissance abonnes
- Rapports PDF ou email simples

## Ce qui doit etre retire du legacy

### Dossiers backend a supprimer

- `socioboard-api/Admin`
- `socioboard-api/Chat`
- `socioboard-api/Feeds`
- `socioboard-api/Notification`
- `socioboard-api/Update/core/alert-mails`
- `socioboard-api/User/core/team*`
- `socioboard-api/User/core/invitation`
- `socioboard-api/User/core/appsumo`
- `socioboard-api/Common/Sequelize-cli/models/user_payments.cjs`
- `socioboard-api/Common/Sequelize-cli/models/coupons.cjs`
- `socioboard-api/Common/Sequelize-cli/models/appsumo_*.cjs`
- `socioboard-api/Common/Sequelize-cli/models/chat_*`
- `socioboard-api/Common/Sequelize-cli/models/boards.cjs`
- `socioboard-api/Common/Sequelize-cli/models/rss_*`
- `socioboard-api/Common/Shared/plan-validation.js`

### Dossiers frontend PHP a supprimer

- `socioboard-web-php/Modules/Boards`
- `socioboard-web-php/Modules/Chat`
- `socioboard-web-php/Modules/ContentStudio`
- `socioboard-web-php/Modules/Discovery`
- `socioboard-web-php/Modules/Feeds`
- `socioboard-web-php/Modules/Reports` a remplacer par la page `analytics`
- `socioboard-web-php/Modules/Team`
- `socioboard-web-php/app/Http/Middleware/Role.php`
- `socioboard-web-php/app/Http/Middleware/checkPlanExpiry.php`
- `socioboard-web-php/app/Http/Middleware/checkPlanAccesses.php`
- `socioboard-web-php/public/js/productTour`

## Architecture cible

```text
erystra-social-next/
├─ app/
│  ├─ (dashboard)/
│  │  ├─ page.tsx
│  │  ├─ posts/page.tsx
│  │  ├─ planner/page.tsx
│  │  └─ analytics/page.tsx
│  ├─ api/
│  │  ├─ auth/login/route.ts
│  │  ├─ auth/seed/route.ts
│  │  ├─ social-accounts/route.ts
│  │  ├─ posts/route.ts
│  │  ├─ schedule/route.ts
│  │  ├─ analytics/summary/route.ts
│  │  └─ reports/route.ts
│  ├─ login/page.tsx
│  └─ layout.tsx
├─ components/
├─ lib/
├─ prisma/schema.prisma
└─ scripts/migrate-legacy.ts
```

## Choix techniques

- `Next.js App Router`: une seule base code frontend + backend, plus simple que l'ancien couple Node/PHP.
- `Prisma + Neon`: schema clair, migrations propres, meilleur fit pour un produit interne maintenable.
- `JWT cookie httpOnly`: auth simple sans infra supplementaire.
- `PostgreSQL`: remplace le duo MySQL + Mongo et supprime la dette de synchronisation.
