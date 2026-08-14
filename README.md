# CognitiveFlow

CognitiveFlow is a personalized cognitive assistance and memory-mirror system designed to support individuals experiencing early cognitive decline or memory disorders. By combining real-time face recognition, calm conversational AI, and a caregiver monitoring portal, CognitiveFlow helps patients recall daily activities, identify visiting family members, and navigate their days with dignity, independence, and peace of mind.

---

## 🚀 Key Features

- **AI Conversational Memory Assistant**: A calm, empathetic voice assistant powered by Google Gemini that answers natural patient questions about daily schedule, meals, and recent events.
- **Vision-Powered Face Recognition**: Camera interface that captures video frames and uses Gemini Vision to identify family members and friends, providing gentle memory context cues.
- **Caregiver Monitoring Dashboard**: Comprehensive portal allowing family members and caregivers to monitor daily activity completion rates, face recognition success metrics, and safety alerts.
- **Family & Friend Profiles**: Detailed profile directory containing relationship context, memory tips, and contact information tailored for the patient.
- **Voice & Speech Synthesis**: Integrated browser Web Speech API for hands-free speech-to-text input and natural text-to-speech voice responses.
- **Strict Data Privacy & Isolation**: Multi-tenant database design ensuring each patient's data, family details, and AI context remain strictly isolated.
- **Role-Based Authentication**: Custom authentication system with separate permissions for primary Patient users and assigned Caregivers.

---

## 🏗️ Architecture

CognitiveFlow follows a full-stack Node.js application architecture where Express serves the Vite-built React single-page application and exposes RESTful API endpoints under a single origin.

### Application Architecture Flow
```
[ User Browser ]
       │
       ▼ (HTTPS / TLS)
┌────────────────────────────────────────────────────────┐
│ Express Server (Node.js + TypeScript)                 │
│   ├── Static File Server (serves /dist/public)         │
│   ├── Authentication Middleware (Passport + Session)   │
│   └── REST API Endpoints (/api/*)                      │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼ (Drizzle ORM)            ▼ (Google GenAI SDK)
   ┌──────────────────────┐   ┌──────────────────────┐
   │ Neon PostgreSQL DB   │   │  Google Gemini API   │
   └──────────────────────┘   └──────────────────────┘
```

### AI Pipeline Flow
```
[ User Input: Camera / Mic ]
       │
       ▼
[ Web MediaStreams / Web Speech API ]
       │ (Base64 Image / Question Text)
       ▼
[ Express API Route (/api/recognize or /api/chat) ]
       │ (Gathers Patient Context from PostgreSQL)
       ▼
[ Google Gemini AI Engine ]
       │ (Generates Empathic Response / JSON Match)
       ▼
[ Web Speech Synthesis / UI Display ]
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla CSS, Tailwind CSS, Radix UI primitives
- **State & Data Fetching**: TanStack React Query (v5)
- **UI Icons & Animations**: Lucide React, Framer Motion, Recharts

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js (`passport-local`), `express-session`, `memorystore`, `scrypt` password hashing

### Database
- **Database**: PostgreSQL (Neon Serverless PostgreSQL)
- **ORM**: Drizzle ORM (`drizzle-orm/neon-http`, `drizzle-zod`)

### Artificial Intelligence & Hardware Integration
- **SDK**: `@google/generative-ai` (Google Generative AI SDK)
- **Models**: `gemini-3.5-flash` (Conversational & Vision AI)
- **Browser APIs**: `navigator.mediaDevices.getUserMedia` (Webcam), `webkitSpeechRecognition` (Speech-to-Text), `SpeechSynthesis` (Text-to-Speech)

---

## 📂 Project Structure

```text
CognitiveFlow/
├── client/                     # Frontend React SPA
│   ├── src/
│   │   ├── components/         # Feature Components
│   │   │   ├── CameraInterface.tsx    # Face Recognition UI & Webcam Stream
│   │   │   ├── VoiceAssistant.tsx     # Voice AI Chat & Speech Synthesis UI
│   │   │   ├── CaregiverDashboard.tsx # Caregiver Monitoring Portal
│   │   │   ├── FamilyProfiles.tsx     # Family Profiles & Context Cards
│   │   │   ├── Navigation.tsx         # Sidebar & Header Navigation
│   │   │   ├── HeroSection.tsx        # Memory Mirror Landing Page
│   │   │   └── ui/                # Radix / Shadcn UI components
│   │   ├── hooks/
│   │   │   └── use-auth.tsx       # Auth Context Provider & React Query Hooks
│   │   ├── lib/
│   │   │   └── queryClient.ts     # Global API Client & Error Interceptor
│   │   ├── pages/
│   │   │   └── AuthPage.tsx       # Login & Registration Page
│   │   ├── App.tsx                # Application Routing & Main Layout
│   │   └── main.tsx               # React Application Entrypoint
├── server/                     # Backend Express Application
│   ├── auth.ts                 # Passport Local Auth & Session Management
│   ├── db.ts                   # Neon PostgreSQL Connection Setup
│   ├── index.ts                # Express App Setup, Security Headers & Listener
│   ├── routes.ts               # REST API Endpoints & Gemini AI Logic
│   ├── storage.ts              # Database Storage Layer CRUD Implementation
│   └── vite.ts                 # Vite SSR / Static Asset Middleware
├── shared/                     # Shared Types & Schemas
│   └── schema.ts               # Drizzle Database Schemas & Zod Validation
├── test_suite.ts               # Automated End-to-End Test Suite
├── seed.ts                     # Database Seeding Script
├── reset_db.ts                 # Schema Reset Script
├── render.yaml                 # Render Infrastructure-as-Code Config
├── DEPLOYMENT.md               # Detailed Production Deployment Guide
├── PROJECT_SUMMARY.md          # Resume & Presentation Summary
├── drizzle.config.ts           # Drizzle Kit Configuration
└── package.json                # Project Dependencies & Scripts
```

---

## ⚙️ Environment Setup

Create a `.env` file in the root directory by copying `.env.example`:

```bash
# Database Connection (Neon / PostgreSQL Connection String with SSL)
DATABASE_URL=postgres://user:password@ep-sample-123.neon.tech/neondb?sslmode=require

# Node Environment
NODE_ENV=development

# Application Port
PORT=5000

# Express Session Secret
SESSION_SECRET=your_secure_random_session_secret_32chars

# Google Gemini API Key (Server-side ONLY)
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash
```

> [!WARNING]
> Never commit your real `GEMINI_API_KEY` or `DATABASE_URL` to version control. The repository `.gitignore` automatically excludes `.env`.

---

## 💻 Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Push Database Schema**:
   ```bash
   npm run db:push
   ```

3. **Seed Database** (Creates test Patient & Caregiver accounts):
   ```bash
   npx tsx seed.ts
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5000` (or `http://localhost:5055`) in your browser.

---

## 📦 Production Build & Execution

1. **Type Check**:
   ```bash
   npm run check
   ```

2. **Build for Production**:
   ```bash
   npm run build
   ```

3. **Start Production Server**:
   ```bash
   npm run start
   ```

4. **Run End-to-End Automated Test Suite**:
   ```bash
   npx tsx test_suite.ts
   ```

---

## 📑 API Documentation

All API endpoints are protected and require session authentication, except `/api/health`, `/api/login`, and `/api/register`.

### 1. `GET /api/health`
- **Auth**: None
- **Response**: `{ "status": "ok", "timestamp": "2026-08-14T..." }`

### 2. `POST /api/login`
- **Auth**: None
- **Body**: `{ "username": "patient", "password": "password123" }`
- **Response**: `200 OK` with user profile (excludes password hash).

### 3. `POST /api/register`
- **Auth**: None
- **Body**: `{ "username": "newuser", "password": "password123", "role": "patient" | "caregiver", "patientId": null }`
- **Response**: `201 Created` with created user profile.

### 4. `POST /api/logout`
- **Auth**: Required
- **Response**: `200 OK` (Destroys server session).

### 5. `GET /api/user`
- **Auth**: Required
- **Response**: Authenticated user object.

### 6. `POST /api/chat`
- **Auth**: Required (`patient` or assigned `caregiver`)
- **Body**: `{ "question": "What did I eat for breakfast?" }`
- **Response**: `{ "response": "You had oatmeal and fresh blueberries for breakfast at 8:00 AM." }`

### 7. `POST /api/recognize`
- **Auth**: Required (`patient` or assigned `caregiver`)
- **Body**: `{ "image": "data:image/jpeg;base64,..." }`
- **Response**: `{ "person": { "id": "...", "name": "Sarah Jenkins", "relationship": "Daughter", ... } }` or `404 Not Found` if unrecognized.

### 8. `GET /api/family`
- **Auth**: Required
- **Response**: `200 OK` array of authorized family members.

### 9. `GET /api/alerts`
- **Auth**: Required
- **Response**: `200 OK` array of recent safety/activity alerts.

### 10. `GET /api/activities`
- **Auth**: Required
- **Response**: `200 OK` array of daily scheduled activities.

### 11. `GET /api/summary`
- **Auth**: Required
- **Response**: `200 OK` patient summary metrics object.

---

## 🛡️ Security & Privacy

- **Patient Data Isolation**: Every database query filters records strictly by `userId` / `patientId`. Users cannot access another patient's data.
- **Server-Side API Keys**: `GEMINI_API_KEY` is loaded exclusively in server memory and is never bundled in frontend JavaScript.
- **Password Hashing**: Passwords are hashed using Node.js native `crypto.scrypt` with unique 16-byte salts.
- **Session Security**: Cookies enforce `HttpOnly`, `SameSite=lax`, and `secure: "auto"`.
- **Security Headers**: Production responses include `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- **Camera & Mic Privacy**: Webcam streams and audio recordings are processed in-memory and strictly discarded. Raw frames/audio are never persisted or logged.

---

## 🤖 AI Architecture & Non-Medical Disclaimer

CognitiveFlow utilizes **Google Gemini** (`gemini-3.5-flash`) as an intelligent context-aware retrieval and vision matching engine.

> [!IMPORTANT]
> **Non-Medical Disclaimer**: CognitiveFlow is an AI-powered assistive memory aid designed to support personal organization and recall. **It is NOT a medical device, diagnostic tool, or substitute for professional healthcare, clinical diagnosis, or medical treatment.**

---

## ⚠️ Limitations

- **Browser Dependency**: Voice recognition relies on Web Speech API (`webkitSpeechRecognition`), supported primarily in Chrome, Edge, and Safari.
- **HTTPS Requirement**: Camera and microphone hardware access require a secure HTTPS origin.
- **Network Dependency**: Face recognition and voice chat require an active internet connection to communicate with Google Gemini APIs.

---

## 🔧 Troubleshooting

- **Camera Not Starting**: Verify browser permissions are granted and the app is served over HTTPS or `localhost`.
- **Speech Recognition Error**: Ensure you are using a supported browser (Chrome/Edge/Safari) and microphone access is allowed.
- **Gemini API Error `400` / `403`**: Verify `GEMINI_API_KEY` in `.env` is valid and active in Google AI Studio.
- **Database Connection Error**: Ensure `DATABASE_URL` includes `?sslmode=require` for Neon PostgreSQL connections.

---

## 🎬 Presentation Demo Flow

1. **Login**: Log in as `patient` (Password: `password123`).
2. **Landing Page**: View the Memory Mirror landing page and click **Start Memory Mirror**.
3. **Voice Assistant**: Open Voice Assistant. Tap **Start Listening** and ask *"What do I need to do today?"*. Hear Gemini speak the patient's schedule aloud.
4. **Face Recognition**: Open Camera Interface. Start camera, capture frame, and view recognized family member context (e.g. Daughter "Sarah Jenkins").
5. **Caregiver Dashboard**: Log out and log in as `caregiver` (Password: `password123`). Access the Caregiver Dashboard to review activity completion rates, alerts, and weekly summaries.

---

## 📊 Project Status

CognitiveFlow is a fully verified, production-deployed full-stack AI application powered by React, Express, PostgreSQL, Drizzle ORM, and Google Gemini.
