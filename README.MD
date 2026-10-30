# CaloriQ

A React Native nutrition tracker with photo-based meal analysis and a personalized AI meal coach.

## Overview

CaloriQ brings meal logging, daily calorie and macronutrient totals, and nutrition goals into one mobile interface. The Expo client communicates with a FastAPI backend, which stores accounts and meals and calls Anthropic for photo analysis and coaching. AI nutrition values are estimates.

This portfolio adaptation rebrands the existing NutriSnap foundation; its application logic and architecture are preserved.

## Implemented features

- Email/password registration and login with persisted JWT sessions, sign-out, and a shared demo account.
- Camera capture or gallery selection for meal photos, with AI estimates for calories, protein, carbohydrates, fat, detected foods, health score, and a recommendation.
- Review analysis before logging a meal; view meal details and delete logged meals.
- Daily dashboard with nutrition progress, meal listing, refresh, and sample-meal loading.
- Editable profile name, nutrition goal (lose, maintain, gain), and daily calorie/macro targets.
- AI coaching based on logged meals and goals, including next-meal suggestions.
- Local upload storage served by the backend; optional PostgreSQL deployment through Docker Compose.

## Technology stack

Versions below reflect repository declarations, not a verified device build.

| Layer | Technologies |
| --- | --- |
| Mobile | Expo SDK 56 (`^56.0.12`), React Native 0.85.3, React 19.2.3, TypeScript `~6.0.3` |
| Navigation and state | React Navigation 6 native stack, React Context and hooks |
| Interface | Expo LinearGradient, Vector Icons, StatusBar, SplashScreen; safe-area-context and react-native-screens |
| Device and persistence | Expo ImagePicker, AsyncStorage, native fetch REST client |
| Tooling | Babel core, babel-preset-expo, React type definitions, npm lockfile |
| API | Python, FastAPI, Uvicorn, Pydantic, email-validator, python-dotenv |
| Storage | SQLAlchemy 2, SQLite by default; PostgreSQL 16 and psycopg 3 in Compose; local photo files |
| Authentication | PyJWT, bcrypt, HTTP bearer authentication |
| AI | Anthropic Python SDK, Claude vision and JSON-schema outputs |
| Containers | Docker, Docker Compose; Python 3.12 slim backend image |

## Architecture and structure

```text
CaloriQ/
|-- app/                      Expo client
|   |-- App.tsx               Providers, navigation, animated splash
|   |-- app.json              Expo display and platform configuration
|   |-- src/
|       |-- components/       Reusable UI and dialogs
|       |-- context/          Authentication/session state
|       |-- lib/              REST client and token persistence
|       |-- screens/          Auth, dashboard, capture, details, coach, goals
|       |-- services/         Typed API calls
|       |-- navigation.ts     Navigation types
|       |-- theme.ts          Shared visual tokens
|       |-- types.ts          Shared client data types
|-- backend/
|   |-- app/
|   |   |-- main.py           API setup, CORS, uploads, router registration
|   |   |-- routers/          Auth, profile, meals, coaching routes
|   |   |-- ai.py             Anthropic requests and output schemas
|   |   |-- auth.py           Password hashing and JWT verification
|   |   |-- config.py         Environment settings
|   |   |-- database.py       Engine and sessions
|   |   |-- models.py         User and Meal database models
|   |   |-- schemas.py        Request and response validation
|   |   |-- utils.py          Image storage and meal serialization
|   |-- .env.example
|   |-- requirements.txt
|   |-- Dockerfile
|-- docs/screenshots/         Illustrative SVG mockups, not device captures
|-- test-images/              Sample meal photos for manual testing
|-- docker-compose.yml       Backend and PostgreSQL services
|-- run-backend.ps1           Windows backend helper
```

The client sends JSON over REST with a bearer token. Photo analysis accepts base64 image data; logging can save a photo under `backend/uploads/`. SQLAlchemy stores user and meal records. The backend creates tables on startup; no migration framework is supplied. The meal-list API defaults to midnight UTC and supports a `since` timestamp; coaching uses the current UTC day.

## Prerequisites

- Node.js and npm compatible with the pinned Expo/React Native dependencies. The repository does not declare a Node engine constraint; Node 22 is a reasonable starting environment to validate locally.
- Python 3.11+ and pip (the container uses Python 3.12).
- Expo Go compatible with this SDK, or an appropriate development build.
- Android emulator/Android Studio or a physical Android device. An iOS simulator requires macOS and Xcode; a physical iPhone can connect to Expo Go from a Windows-hosted server.
- Anthropic credentials and access to a model supporting the request format in `backend/app/ai.py` for AI features.
- Optional: Docker with Docker Compose for PostgreSQL setup.

## Local installation

Run commands from the downloaded repository root. These examples use PowerShell.

### 1. Backend and environment

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` with your local values; the following are placeholders only:

```dotenv
ANTHROPIC_API_KEY=<your-anthropic-api-key>
SECRET_KEY=<your-long-random-signing-secret>
# Optional overrides:
# DATABASE_URL=sqlite:///./<database-filename>.db
# ACCESS_TOKEN_EXPIRE_MINUTES=<token-lifetime-in-minutes>
# CLAUDE_MODEL=<supported-claude-model-id>
```

If omitted, the existing database default is `backend/nutrisnap.db`; it is intentionally retained for data continuity. The existing model default is `claude-opus-4-8`; availability and API compatibility must be verified with your account. Authentication, sample meals, and ordinary meal storage do not require AI calls.

```powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is at `http://localhost:8000`; interactive documentation is at `/docs`, with the schema at `/openapi.json`. Keep the server running. SQLite and upload directories are created automatically. On macOS/Linux, activate with `source .venv/bin/activate` and copy with `cp .env.example .env`.

Alternatively, run `.\run-backend.ps1` from the repository root on Windows. On first use this existing helper creates a virtual environment, installs dependencies (including upgrading pip), and copies the environment example if needed.

### 2. Mobile client

In a second terminal, from the repository root:

```powershell
cd app
npm ci
Copy-Item .env.example .env
```

Set `app/.env`:

```dotenv
EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:8000
```

Use a reachable address: a physical phone needs your computer's LAN IP on the same network, Android's emulator normally uses `http://10.0.2.2:8000`, and an iOS simulator can use `http://localhost:8000`. Allow the backend port through your local firewall if needed. This variable is public client configuration; never put secrets in it.

```powershell
npm start
```

Scan the Expo QR code with a compatible Expo Go installation. For an installed Android emulator run `npm run android`; on macOS with an iOS simulator run `npm run ios`. Restart Expo after changing environment values.

Sign up or choose **Try the demo**, then load sample meals or capture/select a meal photo. The shared demo account and its identifiers are preserved from the foundation.

A `npm run web` script exists, but React DOM and React Native Web are not declared dependencies. Browser support is not verified; Android and iOS are the documented targets. No native `android/` or `ios/` project directories are included.

### 3. Optional PostgreSQL with Docker

From the repository root, first create `backend/.env` as above, then run:

```powershell
docker compose up --build
```

Compose starts PostgreSQL 16 and the API on port 8000. It overrides `DATABASE_URL` to use its database service. The existing database credentials/names remain unchanged for compatibility and are development defaults. Database and uploaded photos persist in the `pgdata` and `uploads` named volumes. The backend creates tables automatically. This does not migrate data from a local SQLite database. Run either the local API or Compose on port 8000 at a time.

## API overview

All auth/profile/meal payloads use JSON. Protected routes require `Authorization: Bearer <access-token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/` | Health response (existing service identifier retained) |
| POST | `/auth/signup` | Register and receive a token |
| POST | `/auth/login` | Authenticate and receive a token |
| GET | `/auth/me` | Read authenticated user |
| GET / PUT | `/profile` | Read/update name and daily targets |
| GET | `/meals` | List meals, optionally filtered by `since` |
| POST | `/meals/analyze` | Analyze a base64 photo through Anthropic |
| POST | `/meals` | Log nutrition and optional image |
| DELETE | `/meals/{meal_id}` | Delete an owned meal |
| POST | `/meals/demo-seed` | Add sample meals to the authenticated account |
| GET | `/coach` | Generate daily coaching through Anthropic |

Uploaded photos are served at `/uploads/...`. See the running API's `/docs` for exact schemas.

## Validation and current limits

No automated test suite, lint script, or CI configuration is included. With client dependencies installed, run `npx --no-install tsc --noEmit` from `app/` for TypeScript checking. Device builds, camera permissions, network access, and live AI requests require separate environment validation. This repository does not claim production readiness.

## Future improvements

Planned possibilities, not implemented features: nutrition trend views, barcode scanning, data export, automated tests/CI, managed database migrations, and deployment hardening.

## Developer

- Portfolio maintainer: ShikharSingh7985 (GitHub identity)
- GitHub profile: [ShikharSingh7985](https://github.com/ShikharSingh7985)

This adaptation covers branding and documentation; it does not claim original authorship of the foundation.

## Acknowledgments and licensing

CaloriQ is adapted from the downloaded **NutriSnap** project. This snapshot contains no project LICENSE/NOTICE file, original author identity, or upstream repository URL, so its project license and attribution terms cannot be verified here. Obtain the upstream URL and license before redistribution and preserve any required notices. No license has been invented or assigned by this rebranding.

Third-party packages remain under their respective licenses; dependency license metadata in `app/package-lock.json` is preserved. The SVG files in `docs/screenshots/` are illustrative mockups retained as design references; no real device screenshots are included.
