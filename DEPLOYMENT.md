# YASA — Deployment & Rollback Runbook

Deploy target for the perfume shop MVP: **NestJS backend** + **Angular 18 frontend**
over **PostgreSQL 17** (via `docker-compose.yml`) on a Linux host.

> Ports: Postgres `5433` · Backend `3001` (no `/api` prefix) · Frontend dev `35629`
> (build output is static and can be served by any static host / reverse proxy).

---

## 1. Prerequisites

- Node.js 20+ and npm
- Docker + Docker Compose (for the database)
- Two environment files are required **before** any build/seed step:

### `backend/.env`

```
DATABASE_URL=postgresql://perfume:123456@localhost:5433/perfume_shop?schema=public
PORT=3001
JWT_ACCESS_SECRET=<long-random>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<long-random>
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
SEED_ADMIN_PASSWORD=<admin-password>
```

### `frontend/src/environments/environment.prod.ts`

`apiUrl` is already `/api`; point your reverse proxy so `/api` → `http://127.0.0.1:3001`
(no rewrite of the `/api` prefix stripping is needed on the backend side — it just
expects to be mounted at `/api` before the proxied traffic reaches port `3001`).

---

## 2. Database (once)

```bash
# from repo root
docker compose up -d            # starts postgres on :5433

cd backend
npm install
npx prisma generate             # generate Prisma client (schema.prisma)
npx prisma migrate deploy       # applies committed migrations
```

`migrate deploy` applies the baseline migration `20260829000000_init`, which includes
the **manual** check constraint `chk_discount`:

```sql
ALTER TABLE "product_variants" ADD CONSTRAINT "chk_discount"
  CHECK ((compare_at_price IS NULL) OR (compare_at_price >= price));
```

> ⚠️ This constraint is **not** expressed in `schema.prisma` (Prisma does not manage
> raw `CHECK` constraints). If you recreate the DB from scratch **without** running
> `migrate deploy`, you must add it manually for parity with the live DB.

Optional seed (sample catalog + admin user):

```bash
npm run prisma:seed             # base seed (admin + roles)
npm run prisma:seed:catalog     # sample products/variants
```

---

## 3. Build & run backend

```bash
cd backend
npm run build                   # -> dist/
node dist/main                  # or: npm run start:prod
```

Backend serves on `PORT` (default `3001`). Product images live under `/uploads` at
repo root (see `admin-products.service.ts`); ensure the reverse proxy serves (or the
process has access to) `/uploads`.

Restart after a code change:

```bash
lsof -ti :3001 | xargs kill
npx nest build
setsid node dist/main
```

---

## 4. Build & serve frontend

```bash
cd frontend
npm install
npx ng build                   # -> dist/frontend/browser (static, offline)
```

Output: `frontend/dist/frontend/browser`. Serve it with any static server, e.g.:

```bash
npx http-server dist/frontend/browser -p 8080
```

### Fonts are self-hosted (no CDN dependency)

Google Fonts are **not** loaded from the network. They are downloaded at build-prep
time into `src/assets/fonts/` (21 woff2 subset files) and declared in
`src/styles/_Fonts.scss`, which is `@use`'d by `src/styles.scss`. The
`<link>`/`preconnect` tags were removed from `index.html`.

Regenerate the local fonts (only needed if you change the requested font list or
weights in the script):

```bash
python3 frontend/scripts/download-fonts.py   # Python 3 stdlib only
```

The script keeps each unicode-range subset as one file and, for **variable fonts**
(Inter 400–600, Playfair Display 500–700 + italic 500, Vazirmatn 400–700), emits
`font-weight: <min> <max>` ranges so all weights resolve locally.

---

## 5. Verification checklist

- [ ] `npx prisma migrate status` reports "Database schema is up to date!"
- [ ] `curl -s http://127.0.0.1:3001/...` reaches the backend (HTTP 200 expected)
- [ ] Frontend build contains **no** `fonts.gstatic.com` / `fonts.googleapis.com` refs
- [ ] All 21 `src:url(/assets/fonts/*.woff2)` files exist in the built output
- [ ] RTL (Persian) UI renders Persian glyphs via local `Vazirmatn`

---

## 6. Rollback

**Backend:** keep the previous `dist/` (or git ref). To roll back:

```bash
cd backend
git checkout <previous-ref> -- src
npx nest build
lsof -ti :3001 | xargs kill
setsid node dist/main
```

**Frontend:** redeploy the previous `dist/frontend/browser` (or serve the prior
build output). Static rollback is instant with no service downtime.

**Database:** migrations are forward-only. To roll back a schema change, restore from
a backup **before** `migrate deploy` was applied — do not hand-edit
`_prisma_migrations`.

**Fonts:** if the font self-hosting regression is suspected, the old
`index.html` `<link>` tags (Google Fonts) are the fallback — re-add them and remove
the `@use './styles/Fonts'` line in `src/styles.scss`.

---

## 7. Notes / gotchas

- Weights must match what was self-hosted. `Dancing Script` was dropped (unused in
  the app); `_Fonts.scss` covers Inter, Playfair Display, Vazirmatn, Courgette,
  Homemade Apple.
- Backend routes have **no** `/api` prefix (port 3001); the frontend expects to call
  `/api` through a proxy that forwards to 3001.
- Check constraints (`chk_*`) are maintained by hand in the baseline migration, not
  by Prisma. Any future manual constraint change should go into a new migration step
  (or be documented here).
