# 🚀 SME Credit Risk — FastAPI + React (Single URL)

Predict SME loan default (PD) and show top drivers — with a simple web app.

- Backend: FastAPI (/score, /demo/score, /auth/login)
- Frontend: React + Vite (single-page wizard, Zod validation)
- Auth: JWT (email/password). Demo path does not need auth
- Safety: 5 req/min/IP rate limit, CORS locked to http://localhost:5173
- Run modes: Dev (two servers) or Single-URL (serve built UI from FastAPI)

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue)](https://www.python.org/)
[![Node](https://img.shields.io/badge/Node-20.19%2B%20or%2022.12%2B-brightgreen)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-💨-teal)](https://fastapi.tiangolo.com/)
[![React + Vite](https://img.shields.io/badge/React%20%2B%20Vite-frontend-61DAFB)](https://vitejs.dev/)
[![CI](https://github.com/10-kp/SME-Credit-Risk-ML/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/10-kp/SME-Credit-Risk-ML/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)


> 💡 Beginners: follow the Quick Start. No MLOps needed.


---


## 🧭 What is this?

- Goal: Estimate Probability of Default (PD) for SME loans and explain key drivers.
- Model: (Rules/stub for Sprint-1). LightGBM/SHAP can be wired later.
- App: FastAPI backend + React (Vite) UI.


### How the pieces fit

```
Frontend (Vite/React)  ->  POST /score (JWT)  ->  FastAPI
                   \->  POST /demo/score (no auth)
FastAPI -> scoring rules -> PD% + band + recommendations + top drivers

```

---


📂 Repo layout

```
api/
  app/
    main.py      # FastAPI app (CORS, rate limits, JWT, routes)
    auth.py      # JWT login (dev user), password hashing
    scoring.py   # PD scoring + drivers + recommendations
    rules.py     # risk bands + product templates
    schemas.py   # Pydantic request/response models
  static/        # optional: built frontend for Single-URL mode
  requirements.txt
frontend/
  src/           # React app (wizard form + results card)
  package.json

```

---
⚡ Quick Start (Dev mode — live reload)

Terminal A — Backend (Windows PowerShell).

Windows (PowerShell)
```
cd C:\Users\DELL\SME-Credit-Risk-ML
conda deactivate            # run until (base) disappears; harmless if not active
.\api\.venv\Scripts\Activate.ps1
$env:PYTHONPATH = "$PWD"
.\api\.venv\Scripts\python.exe -m uvicorn api.app.main:app --reload --port 8000

```
Check:

- Health: http://127.0.0.1:8000/healthz
- Docs: http://127.0.0.1:8000/docs


---

Terminal B — Frontend

```
cd C:\Users\DELL\SME-Credit-Risk-ML\frontend
npm install
npm run dev

```

Open: http://localhost:5173

Using the app

Click Quick demo → calls /demo/score (no login)
Click Sign in → Email demo@user.test, Password demo1234 → then Score uses protected /score

---
🔗 Single-URL mode (serve built UI from FastAPI)

This builds the React app and serves it from the API at http://127.0.0.1:8000.

Windows PowerShell

```
# build the UI
cd C:\Users\DELL\SME-Credit-Risk-ML\frontend
del .env.local 2>$null      # ensure no dev override
npm install
npm run build

# copy into backend static/
Copy-Item -Recurse -Force .\dist\* ..\api\static\

# run API
cd ..\api
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

```

Open:

UI + API: http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs

---

Mac/Linux

```
cd frontend
rm -f .env.local
npm install && npm run build
cp -R dist/* ../api/static/

cd ../api
uvicorn app.main:app --host 127.0.0.1 --port 8000

```

---

🔐 Auth, Endpoints & Payloads

Dev credentials

- Email: demo@user.test
- Password: demo1234

Endpoints

- POST /auth/login → { "access_token": "..." } (JWT)
- POST /score → requires Authorization: Bearer <token>
- POST /demo/score → no auth
- GET /healthz → { "ok": true }

Request body (both /score and /demo/score):

```
{
  "revenue": 12000000,
  "ebitda": 1800000,
  "dscr": 1.8,
  "leverage": 2.5,
  "bank_limits": 5000000,
  "tenor_months": 24,
  "sector": "manufacturing"
}

```

Response (example):
```
{
  "pd_pct": 2.33,
  "risk_band": "amber",
  "recommendations": [
    {"product":"LC","tenor_months":6,"limit":1750000.0},
    {"product":"Guarantees","tenor_months":12,"limit":1750000.0},
    {"product":"Invoice Discounting","tenor_months":3,"limit":1500000.0}
  ],
  "top_drivers": [
    {"label":"DSCR","contribution":-0.53},
    {"label":"Leverage","contribution":0.41},
    {"label":"EBITDA margin","contribution":-0.05}
  ],
  "notes": "rules:v1"
}

```


---
🧪 Quick API tests (PowerShell)

Get a token:
```
$TOKEN = (Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/auth/login" `
  -ContentType "application/x-www-form-urlencoded" `
  -Body @{username="demo@user.test"; password="demo1234"}).access_token

```

Protected score:

```
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/score" `
  -Headers @{ Authorization = "Bearer $TOKEN" } `
  -ContentType "application/json" `
  -Body '{"revenue":12000000,"ebitda":1800000,"dscr":1.8,"leverage":2.5,"bank_limits":5000000,"tenor_months":24,"sector":"manufacturing"}'

```

Demo score (no token):

```
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/demo/score" `
  -ContentType "application/json" `
  -Body '{"revenue":12000000,"ebitda":1800000,"dscr":1.8,"leverage":2.5,"bank_limits":5000000,"tenor_months":24,"sector":"manufacturing"}'

```

---

⚙️ Dev details

- Validation: Zod on the frontend (numeric fields must not be empty)
- CORS (dev): allow_origins=["http://localhost:5173"]
- Rate limit: 5 requests/minute/IP (SlowAPI)
- JWT secret: hardcoded for dev; move to env var for production
- Password hashing: PBKDF2 (portable). bcrypt also works if pinned.


---

🩺 Troubleshooting (fast)

“Score” does nothing
Open DevTools → Console. If you see formErrors, a numeric field is blank (becomes NaN). Fill it and try again.

401 on /score
You’re not signed in. Click Sign in (or use Quick demo which calls /demo/score).

429 Too Many Requests
You hit the rate limit (5/min). Wait ~60s or use /demo/score.

CORS error from browser
Ensure the backend has CORS middleware allowing http://localhost:5173, then restart Uvicorn.

Conda vs venv conflicts
Run backend with the project venv:

```
conda deactivate
.\api\.venv\Scripts\Activate.ps1
$env:PYTHONPATH = "$PWD"
.\api\.venv\Scripts\python.exe -m uvicorn api.app.main:app --reload --port 8000

```

---

☁️ Deploy (single URL)

- Root: api
- Build: pip install -r requirements.txt
- Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
- During deploy, copy frontend/dist/* → api/static/ so one service serves UI + API


---

📜 License

MIT — use freely, improve boldly ✨



