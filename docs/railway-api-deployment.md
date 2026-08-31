# Deploying the DreamElevator API to Railway

This guide walks through deploying the **DreamElevator .NET 7 Web API** (`backend/src/DreamElevator.API`) to [Railway](https://railway.com), backed by a Railway‑managed MySQL database (and, optionally, Redis).

> **Why Docker?** Railway's native builder (Railpack/Nixpacks) does **not** support .NET, so a `Dockerfile` is required. This repo already ships one at [`docker/Dockerfile.api`](../docker/Dockerfile.api), so no changes to the app are strictly required to deploy.

---

## 1. What gets deployed

| Concern | How the API handles it | What you configure on Railway |
| --- | --- | --- |
| **Build** | Multi‑stage build in `docker/Dockerfile.api` (SDK 7 → ASP.NET 7 runtime) | `RAILWAY_DOCKERFILE_PATH` variable |
| **Port** | Kestrel binds to `ASPNETCORE_URLS` | `ASPNETCORE_URLS` + `PORT` |
| **Database** | MySQL via EF Core (Pomelo), read from `ConnectionStrings__DefaultConnection` | MySQL service + reference variables |
| **Migrations** | Runs `Database.MigrateAsync()` **and seeds data automatically on startup** — no manual step | (nothing — automatic) |
| **Cache** | Redis via `ConnectionStrings__Redis`; **falls back to in‑memory** if unset | Optional Redis service |
| **Auth** | JWT signing key from `Jwt__Secret` (required, ≥32 chars) | `Jwt__*` variables |
| **CORS** | Reads `Cors:Origins` array in Production | `Cors__Origins__0`, `Cors__Origins__1`, … |
| **Uploads** | Written to `wwwroot/uploads` on local disk (**ephemeral!**) | Railway Volume (recommended) |
| **Health** | `GET /health` (checks DB connectivity) | Healthcheck path |

---

## 2. Prerequisites

- A [Railway account](https://railway.com) (the Hobby plan is enough to start).
- This repo pushed to GitHub: `https://github.com/jdflores22/tnsds` ✅ (already done).
- Two strong secrets for JWT (each ≥ 32 characters). Generate them, e.g.:

```bash
# PowerShell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Max 256 }))

# macOS/Linux
openssl rand -base64 48
```

---

## 3. Create the project and provision MySQL

1. In the Railway dashboard, click **New Project**.
2. Choose **Deploy MySQL** (or **New → Database → Add MySQL**). This creates a `MySQL` service that exposes these variables: `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQL_URL`.
3. *(Optional)* Add **Redis** the same way (**New → Database → Add Redis**) if you want a real distributed cache. If you skip this, the API automatically uses an in‑memory fallback.

> Keep the database in the **same Railway project** as the API so they can talk over Railway's private network (`*.railway.internal`), which is faster and doesn't incur egress.

---

## 4. Create the API service from GitHub

1. In the same project, click **New → GitHub Repo** and select `jdflores22/tnsds`.
2. When the service is created, open it and go to **Settings**.
3. **Leave the Root Directory at `/`** (the repo root). The Dockerfile uses `COPY backend/...` paths that are relative to the repo root, so the full repo must be the build context.
4. Under **Deploy → Healthcheck Path**, set `/health`.

---

## 5. Point Railway at the Dockerfile

Because the Dockerfile isn't named `Dockerfile` at the repo root, tell Railway where it is.

In the API service's **Variables** tab, add:

```
RAILWAY_DOCKERFILE_PATH=docker/Dockerfile.api
```

> There is **no** competing `Dockerfile` at the repo root, so BuildKit will correctly pick up `docker/Dockerfile.api`. Do **not** set a Root Directory — doing so would change the build context and break the `COPY backend/...` lines.

---

## 6. Configure environment variables

Open the API service → **Variables** and add the following. Use Railway's **reference variable** syntax (`${{ServiceName.VAR}}`) to pull DB credentials from the MySQL service — replace `MySQL` below if you named the service differently.

### Required

```env
# --- Runtime ---
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:8080
PORT=8080

# --- Build ---
RAILWAY_DOCKERFILE_PATH=docker/Dockerfile.api

# --- Database (references the MySQL service) ---
ConnectionStrings__DefaultConnection=Server=${{MySQL.MYSQLHOST}};Port=${{MySQL.MYSQLPORT}};Database=${{MySQL.MYSQLDATABASE}};User=${{MySQL.MYSQLUSER}};Password=${{MySQL.MYSQLPASSWORD}};

# --- JWT (use your generated secrets) ---
Jwt__Secret=<your-32+char-access-secret>
Jwt__RefreshSecret=<your-32+char-refresh-secret>
Jwt__Issuer=DreamElevator.API
Jwt__Audience=DreamElevator.Client
Jwt__AccessTokenExpirationHours=1
```

### CORS (add one entry per allowed front‑end origin)

The app binds `Cors:Origins` as a string array, so each origin is its own indexed key:

```env
Cors__Origins__0=https://lightgray-alpaca-580456.hostingersite.com
```

> Add one line per front‑end origin. List the origin **without a trailing slash** (scheme + host only). When you attach a custom domain in Hostinger later, add it as `Cors__Origins__1=https://yourdomain.com`.
>
> In `Production` the API only allows the origins you list here (unlike Development, which allows any localhost). If the front end can't call the API, a missing/incorrect origin here is the usual cause.

### Optional — Redis (only if you added a Redis service)

```env
ConnectionStrings__Redis=${{Redis.REDISHOST}}:${{Redis.REDISPORT}},password=${{Redis.REDISPASSWORD}},ssl=false
```

If you omit this, the API logs that it's using the in‑memory cache and keeps working.

### Optional — SMTP (contact form / notifications)

```env
Smtp__Host=smtp.yourprovider.com
Smtp__Port=587
Smtp__Username=<smtp-user>
Smtp__Password=<smtp-pass>
Smtp__From=noreply@trans-net.com
Smtp__EnableSsl=true
```

### Quick paste — Railway Raw Editor

In the API service → **Variables**, click the **Raw Editor** and paste the block below in one go, then fill in the `<...>` placeholders and your real CORS origins. Delete the Redis/SMTP lines if you aren't using them. Replace `MySQL` / `Redis` if your database services have different names.

```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:8080
PORT=8080
RAILWAY_DOCKERFILE_PATH=docker/Dockerfile.api
ConnectionStrings__DefaultConnection=Server=${{MySQL.MYSQLHOST}};Port=${{MySQL.MYSQLPORT}};Database=${{MySQL.MYSQLDATABASE}};User=${{MySQL.MYSQLUSER}};Password=${{MySQL.MYSQLPASSWORD}};
Jwt__Secret=<your-32+char-access-secret>
Jwt__RefreshSecret=<your-32+char-refresh-secret>
Jwt__Issuer=DreamElevator.API
Jwt__Audience=DreamElevator.Client
Jwt__AccessTokenExpirationHours=1
Cors__Origins__0=https://lightgray-alpaca-580456.hostingersite.com
ConnectionStrings__Redis=${{Redis.REDISHOST}}:${{Redis.REDISPORT}},password=${{Redis.REDISPASSWORD}},ssl=false
Smtp__Host=smtp.yourprovider.com
Smtp__Port=587
Smtp__Username=<smtp-user>
Smtp__Password=<smtp-pass>
Smtp__From=noreply@trans-net.com
Smtp__EnableSsl=true
```

> If you commit the [`railway.toml`](../railway.toml) config (already in this repo), you can drop the `RAILWAY_DOCKERFILE_PATH` line — the build path is defined there.

### Variable reference

| Variable | Required | Example / source | Notes |
| --- | --- | --- | --- |
| `ASPNETCORE_ENVIRONMENT` | ✅ | `Production` | Disables Swagger; enables configured‑origin CORS. |
| `ASPNETCORE_URLS` | ✅ | `http://0.0.0.0:8080` | Must bind `0.0.0.0`, not localhost. |
| `PORT` | ✅ | `8080` | Must match the port in `ASPNETCORE_URLS`. |
| `RAILWAY_DOCKERFILE_PATH` | ✅¹ | `docker/Dockerfile.api` | ¹Not needed if `railway.toml` is committed. |
| `ConnectionStrings__DefaultConnection` | ✅ | `${{MySQL.*}}` refs | Pomelo/MySQL format; uses private host. |
| `Jwt__Secret` | ✅ | ≥ 32 random chars | Access‑token signing key. |
| `Jwt__RefreshSecret` | ✅ | ≥ 32 random chars | Refresh‑token signing key. |
| `Jwt__Issuer` | ✅ | `DreamElevator.API` | Must match token validation. |
| `Jwt__Audience` | ✅ | `DreamElevator.Client` | Must match token validation. |
| `Jwt__AccessTokenExpirationHours` | ⬜ | `1` | Defaults handled in config if omitted. |
| `Cors__Origins__0`, `__1`, … | ✅² | front‑end URLs | ²Required for the browser front end to call the API. |
| `ConnectionStrings__Redis` | ⬜ | `${{Redis.*}}` refs | Omit → in‑memory cache fallback. |
| `Smtp__*` | ⬜ | your mail provider | Only needed for outbound email. |

---

## 7. Networking & public domain

1. In the API service → **Settings → Networking**, click **Generate Domain**. Railway assigns a `*.up.railway.app` URL and routes external HTTPS traffic to your container's port.
2. Because you set `PORT=8080` and `ASPNETCORE_URLS=http://0.0.0.0:8080`, Railway forwards traffic to `8080`. (Railway terminates TLS at its edge and forwards plain HTTP to the container — this is expected.)

> **About `UseHttpsRedirection()`:** the app calls `app.UseHttpsRedirection()`. Inside the container it only listens on HTTP, so ASP.NET can't determine an HTTPS port and simply logs a one‑time warning without redirecting — this is harmless behind Railway's proxy. If the warning bothers you, you can guard it with `if (!app.Environment.IsProduction())`, but it is not required for a working deploy.

---

## 8. Persist uploaded files (important)

`LocalFileStorageService` writes uploads to `wwwroot/uploads`. Railway container filesystems are **ephemeral** — anything written there is **lost on every redeploy/restart**. To keep uploaded images:

1. API service → **Settings → Volumes → New Volume**.
2. Set the **Mount Path** to:

```
/app/wwwroot/uploads
```

(The Dockerfile's `WORKDIR` is `/app`, and it creates `wwwroot/uploads`.)

3. Redeploy. Uploads now survive restarts and deploys.

---

## 9. Deploy & verify

1. Trigger a deploy (Railway auto‑deploys on push to `main`, or click **Deploy**).
2. Watch **Deployments → Logs**. On first boot you should see EF Core apply migrations and the seeder run, then Serilog request logging start.
3. Verify the health endpoint:

```bash
curl https://<your-service>.up.railway.app/health
# Expect: Healthy
```

4. Test login with the seeded admin account (check `DatabaseSeeder.cs` for the seeded credentials) against `POST /api/v1/auth/login`.

---

## 10. Optional: config‑as‑code

Instead of setting `RAILWAY_DOCKERFILE_PATH` and the healthcheck in the dashboard, you can commit a `railway.toml` to the repo root:

```toml
[build]
builder = "dockerfile"
dockerfilePath = "docker/Dockerfile.api"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
```

Environment variables (secrets, DB references) are still best managed in the dashboard.

---

## 11. Optional: deploy via the Railway CLI

```bash
npm i -g @railway/cli      # or: brew install railway
railway login
railway link               # pick the project you created
railway up                 # build & deploy from your local checkout
railway logs               # stream logs
```

---

## 12. Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| Build uses the wrong/no Dockerfile | Ensure `RAILWAY_DOCKERFILE_PATH=docker/Dockerfile.api` and **Root Directory = `/`**. |
| Deploy is "healthy" internally but the domain 502s | App not listening on the forwarded port. Confirm `ASPNETCORE_URLS=http://0.0.0.0:8080` and `PORT=8080` match. |
| Browser shows **CORS** + **502** on every API call | The API is **down**, not a CORS config bug. Railway returns 502 without CORS headers, so the browser reports both. Fix the API first (logs, DB, port). |
| `Database connection string 'DefaultConnection' is not configured` | The `ConnectionStrings__DefaultConnection` variable is missing or the MySQL reference name is wrong. |
| Startup crash connecting to DB | MySQL service not in the same project, or using the public host. Use `${{MySQL.MYSQLHOST}}` (private `*.railway.internal`). Migrations run at boot, so the DB must be reachable. |
| Startup crash after importing a localhost MySQL dump | Imported schema can conflict with EF migrations (`Table 'X' already exists`, migration history mismatch). **Do not import dumps into Railway** unless you know the schema matches current migrations. Prefer a clean DB (see §13). |
| `JWT Secret is not configured` | Set `Jwt__Secret` (≥ 32 chars). |
| Front end blocked by CORS (API returns 200 but browser blocks) | Add the exact front‑end origin as `Cors__Origins__0`, `__1`, … (scheme + host, no trailing slash). |
| Uploaded images disappear after deploy | Attach a Volume at `/app/wwwroot/uploads` (see §8). |
| Redis errors in logs | Either fix `ConnectionStrings__Redis` or remove it to use the in‑memory fallback. |

---

## 13. Recovering after wiping or importing the database

The API runs **`Database.MigrateAsync()` on every startup** before it listens for traffic. If the MySQL schema is empty, corrupted, or partially imported from localhost, startup can fail and Railway will show **502 Bad Gateway** for `/health` and all `/api/v1/*` routes.

### Recommended: fresh database (let the app migrate + seed)

1. In Railway, open your **MySQL** service → **Data** (or connect with the CLI).
2. **Drop all tables** in the app database, or delete the MySQL service and add a new one in the same project.
3. If you recreated MySQL, confirm the API service still has:
   ```env
   ConnectionStrings__DefaultConnection=Server=${{MySQL.MYSQLHOST}};Port=${{MySQL.MYSQLPORT}};Database=${{MySQL.MYSQLDATABASE}};User=${{MySQL.MYSQLUSER}};Password=${{MySQL.MYSQLPASSWORD}};
   ```
4. Confirm API variables are still set: `ASPNETCORE_ENVIRONMENT=Production`, `ASPNETCORE_URLS=http://0.0.0.0:8080`, `PORT=8080`, `Jwt__Secret`, `Jwt__RefreshSecret`, `Cors__Origins__0=https://lightgray-alpaca-580456.hostingersite.com`.
5. **Redeploy** the API service (Deployments → Redeploy).
6. Watch **Deploy logs**. You should see migration + seed messages, then request logging.
7. Verify:
   ```bash
   curl https://tnsds-production.up.railway.app/health
   # Expect: Healthy
   ```

The seeder repopulates default content (admin user, services, settings, SEO, etc.). Check `DatabaseSeeder.cs` for the seeded admin credentials.

### Avoid importing localhost dumps to Railway

Local XAMPP dumps often include tables **and** data but the wrong `__EFMigrationsHistory` state, or an older schema. That makes EF try to create tables that already exist. If you must restore production data, export **only the data** into a schema that was created by a successful Railway deploy, or restore to localhost first and verify migrations match before attempting a remote import.

### Copy localhost *content* safely (optional)

1. Fix Railway with a **clean** migrate + seed first (site works with defaults).
2. Use the admin CMS on production to re-enter content, **or**
3. Export/import specific tables only after confirming column names match the current EF model (advanced — easy to break startup).

---

**Summary of the minimum viable setup:** MySQL service + API service with `RAILWAY_DOCKERFILE_PATH`, `ASPNETCORE_ENVIRONMENT=Production`, `ASPNETCORE_URLS`/`PORT`, the `ConnectionStrings__DefaultConnection` reference, and the two `Jwt__*` secrets. Add a Volume for uploads and CORS origins for the front end, then generate a public domain.
