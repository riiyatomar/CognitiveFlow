# CognitiveFlow — Portfolio & Resume Summary

## One-Line Description
CognitiveFlow is a full-stack, AI-powered cognitive assistance system built with React, Express, PostgreSQL, and Google Gemini that aids individuals with early cognitive decline through face recognition, contextual voice assistance, and caregiver monitoring.

---

## Technical Bullet Points (Resume Ready)

- **Engineered Full-Stack AI Assistive Platform**: Built a full-stack React 18, TypeScript, Node.js, and Express application integrated with Google Gemini (`gemini-3.5-flash`) for real-time face recognition and empathetic memory assistance.
- **Architected Secure Multi-Tenant Data Isolation**: Implemented strict role-based access control (RBAC) and patient-data isolation in Drizzle ORM and Neon PostgreSQL, ensuring multi-user privacy across API endpoints and AI prompt contexts.
- **Developed Real-Time Vision & Voice Interfaces**: Integrated Web MediaStreams for webcam frame analysis and Web Speech API (STT / TTS) for hands-free speech interaction, featuring reactive state management (`isSpeaking`, `isListening`, `analyzing`).
- **Hardened Production Security & Infrastructure**: Implemented `scrypt` password hashing, `HttpOnly`/`SameSite=lax` session cookies, dynamic security headers (`nosniff`, `DENY`, `Permissions-Policy`), and automated full-stack build/deployment pipelines on Render.

---

## Technical Stack

- **Frontend**: React 18, TypeScript, Vite, TanStack React Query, Tailwind CSS, Radix UI, Framer Motion, Recharts, Lucide React
- **Backend**: Node.js, Express.js, TypeScript, Passport.js, Express-Session, MemoryStore
- **Database**: Neon PostgreSQL, Drizzle ORM
- **AI & Hardware**: Google Gemini SDK (`@google/generative-ai`), Web Speech API, MediaDevices WebCam API
- **Tooling & Infrastructure**: Render PaaS (`render.yaml`), Drizzle Kit, Docker/PaaS Ready
