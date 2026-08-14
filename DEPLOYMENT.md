# CognitiveFlow — Production Deployment & Infrastructure Guide

This guide provides complete, step-by-step instructions for deploying **CognitiveFlow** into a production environment.

---

## 1. Architecture Overview

CognitiveFlow is deployed as a **single full-stack Node.js Web Service**.

```
[ Browser (HTTPS) ] 
       │
       ▼ (HTTPS / TLS Terminal)
┌────────────────────────────────────────────────────────┐
│ PaaS Platform (Render / Railway / Cloud Run)          │
│                                                        │
│   Express Backend (Port 5000 / PORT)                   │
│   ├── Serves Vite Client Assets (/dist/public)         │
│   ├── Handlers for /api/* Endpoints                     │
│   └── Session Manager (express-session + memorystore)  │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼ (SSL)                    ▼ (HTTPS)
   ┌──────────────────────┐   ┌──────────────────────┐
   │ Neon PostgreSQL DB   │   │  Google Gemini API   │
   └──────────────────────┘   └──────────────────────┘
```

### Rationale:
- **Zero CORS Issues**: Serving static frontend assets directly from Express under the same origin avoids complex cross-origin credential issues.
- **HTTPS Enforcement**: Hosting on PaaS platforms automatically provides free TLS certificates. **HTTPS is strictly required by modern browsers for WebCam (Camera) and Web Speech API (Microphone) access.**
- **Server-Side API Key Protection**: The `GEMINI_API_KEY` remains strictly environment-configured on the backend, preventing key leakage to end-users.

---

## 2. Prerequisites & Accounts Required

Before deploying, ensure you have:
1. A **GitHub** account containing the CognitiveFlow repository.
2. A **Render** (or Railway / Vercel / Cloud Run) account.
3. A **Neon PostgreSQL** database instance (or any PostgreSQL 14+ database).
4. A **Google Gemini API Key** (obtained from [Google AI Studio](https://aistudio.google.com/)).

---

## 3. Production Environment Variables

Configure the following environment variables on your deployment platform:

| Variable | Required | Default / Sample | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgres://user:pass@ep-xyz.tech/neondb?sslmode=require` | PostgreSQL connection string with SSL |
| `GEMINI_API_KEY` | **Yes** | `AIzaSy...` | Server-side Google Gemini API Key |
| `GEMINI_MODEL` | Optional | `gemini-3.5-flash` | Gemini model identifier |
| `SESSION_SECRET` | **Yes** | `a_random_32_character_string_here` | Secret key used to sign session cookies |
| `NODE_ENV` | **Yes** | `production` | Enables production mode, optimizes builds & enforces secure cookies |
| `PORT` | Optional | `5000` | Port assigned by hosting provider (automatically set on Render/Railway) |

---

## 4. Database Setup & Schema Deployment

1. **Create Database**: Create a new database project on [Neon](https://neon.tech/) and copy the connection string.
2. **Push Database Schema**:
   Run schema migration locally or via CI/CD pointing to your production database URL:
   ```bash
   DATABASE_URL="postgres://user:pass@ep-xyz.tech/neondb?sslmode=require" npx drizzle-kit push
   ```
3. **Seed Initial Data** (Optional for testing):
   ```bash
   DATABASE_URL="postgres://user:pass@ep-xyz.tech/neondb?sslmode=require" npx tsx seed.ts
   ```

---

## 5. Deployment Methods

### Method A: One-Click Render Deployment (Recommended)

This repository includes a `render.yaml` infrastructure configuration.

1. Log into [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository containing CognitiveFlow.
4. Render will automatically detect `render.yaml`.
5. Enter your `DATABASE_URL` and `GEMINI_API_KEY` when prompted in the dashboard.
6. Click **Apply**. Render will build (`npm run check && npm run build`) and start (`npm run start`) the service.

### Method B: Manual PaaS Deployment (Railway / Render Web Service)

1. Create a new **Web Service** pointing to your repository branch.
2. Set the following settings:
   - **Environment**: Node
   - **Build Command**: `npm run check && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/health`
3. Add the Environment Variables (`DATABASE_URL`, `GEMINI_API_KEY`, `SESSION_SECRET`, `NODE_ENV=production`).
4. Trigger the deployment.

---

## 6. HTTPS & Hardware Permissions

> [!IMPORTANT]
> Modern web browsers (Chrome, Safari, Firefox, Edge) **strictly disable webcam and microphone access** on insecure (`http://`) origins (except `localhost`).

- Ensure your domain uses **HTTPS**. Render and Railway provide free managed SSL certificates out of the box.
- The backend automatically transmits `Permissions-Policy: camera=(self), microphone=(self)` security headers to ensure browser hardware APIs operate correctly.

---

## 7. Verifying Deployment Health

Once deployed, verify your service is operating correctly:

1. **Health Check**:
   Open `https://your-app-domain.com/api/health` in your browser.
   Expected response:
   ```json
   { "status": "ok", "timestamp": "2026-08-14T..." }
   ```
2. **Authentication Test**:
   Navigate to `https://your-app-domain.com/` and log in with your seeded credentials:
   - **Patient Username**: `patient` / Password: `password123`
   - **Caregiver Username**: `caregiver` / Password: `password123`
3. **Hardware Test**:
   - Access **Face Recognition** and accept camera permissions.
   - Access **Voice Assistant** and accept microphone permissions. Test a query against Gemini.

---

## 8. Troubleshooting Guide

- **Error `EADDRINUSE`**: Occurs if port binding fails. Ensure `PORT` environment variable is handled dynamically via `process.env.PORT`.
- **Gemini API Error `400` / `403`**: Verify `GEMINI_API_KEY` is correctly set in environment variables and billing/quota is enabled in Google Cloud Console / AI Studio.
- **Database Connection Error**: Verify `sslmode=require` is appended to your `DATABASE_URL`. Neon database connections require TLS.
- **Session Reset / Login Loop**: Ensure `trust proxy` is set to `1` in `server/auth.ts` (already configured) so secure cookies work behind PaaS load balancers.
