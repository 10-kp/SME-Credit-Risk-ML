# SME Credit Risk — FastAPI + React (Single URL)

A production-friendly app where **FastAPI** serves both the API and the built **React (Vite)** UI.  
Predict SME loan default probability (LightGBM) and show top drivers.

---

## Prerequisites
- **Python** 3.11 or 3.12
- **Node.js** 20.19+ (or 22.12+)
- **Git** latest

---

## Repository Layout
api/
main.py # FastAPI app (serves API + built UI)
requirements.txt
models/
model.txt # LightGBM model (tracked in git for simple deploys)
static/ # frontend build goes here (assets/ + index.html)
frontend/
src/ # React app (Vite + TS)
package.json
.github/workflows/ci.yml # CI builds API+UI on pushes


---

## Quick Start (Local, Single URL)

> Result: open **http://127.0.0.1:8000** and you’ll see the UI;  
> API docs at **http://127.0.0.1:8000/docs**.

1) **Create venv & install API deps**
```powershell
cd api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt


###2. Build the frontend and place it under api/static/

cd ..\frontend
# (ensure no dev override so the UI uses same-origin API)
del .env.local 2>$null
npm install
npm run build
Copy-Item -Recurse -Force .\dist\* ..\api\static\


###3. Run the server

cd ..\api
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 127.0.0.1 --port 8000

###4. Open

UI: http://127.0.0.1:8000

API docs: http://127.0.0.1:8000/docs

---

##Dev Mode (Two Terminals, Live Reload)

###Terminal A — API

cd api
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload


###Terminal B — Frontend
cd frontend
# point the UI at the local API:
echo VITE_API_URL=http://127.0.0.1:8000/api/score > .env.local
npm install
npm run dev
# open http://localhost:5173


---

Deploy (Render/Railway — Single URL)

Root directory: api

Build: pip install -r requirements.txt

Start: uvicorn main:app --host 0.0.0.0 --port $PORT

Because the React build is copied into api/static/ and model.txt is present in api/models/, your single service will serve both UI and API from one URL.

⚠️ If your repo is public and the model is sensitive, remove it from git and download it at startup instead.


---

##Endpoints

POST /api/score → { pd: number, feats: [ {name, value} ], model_version }

/docs → OpenAPI UI

/health → { "ok": true } (if enabled)

/ → built React app (after you copy frontend/dist into api/static/)


---

##Configuration (Frontend → API URL)

In frontend/src/App.tsx the API URL is:

// uses env var in dev; falls back to same-origin in prod
const API_URL = import.meta.env.VITE_API_URL || "/api/score";


Dev: create frontend/.env.local with
VITE_API_URL=http://127.0.0.1:8000/api/score

Prod (single URL): no env needed; UI uses "/api/score" on the same host.


---

Troubleshooting

Cannot activate venv (PowerShell):

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1


“Connection refused” to /docs: make sure Uvicorn is running and you didn’t close that terminal.

Node version warning (Vite): upgrade Node to 20.19+ (or 22.12+).

CORS errors (only when split-hosting): add your frontend origin in main.py:

allow_origins=["http://localhost:5173","http://127.0.0.1:5173","https://YOUR-UI-DOMAIN"]



