# 🚀 SME Credit Risk — FastAPI + React (Single URL)

Predict SME loan default (PD) with **LightGBM** and show top drivers — all in a **one-link app** where **FastAPI** serves the built **React (Vite)** UI.

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue)](https://www.python.org/)
[![Node](https://img.shields.io/badge/Node-20.19%2B%20or%2022.12%2B-brightgreen)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-💨-teal)](https://fastapi.tiangolo.com/)
[![React + Vite](https://img.shields.io/badge/React%20%2B%20Vite-frontend-61DAFB)](https://vitejs.dev/)
[![CI](https://github.com/10-kp/SME-Credit-Risk-ML/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/10-kp/SME-Credit-Risk-ML/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> 💡 **For beginners:** You don’t need MLOps experience. Follow the **Quick Start** below; it gets you from zero → running app in minutes.

---

## 🧭 What is this?

- **Goal:** Estimate **Probability of Default (PD)** for SME loans and **explain** the prediction.
- **Model:** LightGBM (fast gradient-boosted trees).
- **Explanations:** SHAP if available, otherwise LightGBM feature gains.
- **App:** FastAPI backend + React (Vite) UI. **One URL** for users.

### How the pieces fit

```
mermaid
flowchart LR
  UI[React + Vite (frontend)] -->|POST /api/score| API[FastAPI]
  API --> Model[LightGBM model.txt]
  API --> Explain[SHAP / Feature Gain]
  API -->|serves| Static[Built UI (api/static)]
```

---

📂 Repo layout
```
api/
  main.py            # FastAPI app (API + serves built UI)
  requirements.txt
  models/
    model.txt        # LightGBM model (committed for easy deploys)
  static/            # place frontend build here (assets/ + index.html)
frontend/
  src/               # React app (Vite + TS)
  package.json
.github/workflows/ci.yml   # installs API, builds UI on push
```

⚡ Quick Start (Single URL on your laptop)

Result: open http://127.0.0.1:8000 and you’ll see the UI.
API docs live at http://127.0.0.1:8000/docs.

---

Windows (PowerShell)
```
# 1) Backend env + deps
cd api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 2) Build the UI and copy into api/static
cd ..\frontend
# ensure no dev override so UI uses same-origin:
del .env.local 2>$null
npm install
npm run build
Copy-Item -Recurse -Force .\dist\* ..\api\static\

# 3) Run the server
cd ..\api
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Mac/Linux (bash/zsh)
```
# 1) Backend env + deps
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2) Build the UI and copy into api/static
cd ../frontend
# ensure no dev override so UI uses same-origin:
rm -f .env.local
npm install
npm run build
cp -R dist/* ../api/static/

# 3) Run the server
cd ../api
uvicorn main:app --host 127.0.0.1 --port 8000
```

Open:

UI → http://127.0.0.1:8000
API docs → http://127.0.0.1:8000/docs


---
👩‍💻 Dev Mode (live reload)

Use two terminals.

Terminal A — API
```
cd api
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal B — Frontend
```
cd frontend
# point UI to the local API during dev:
echo VITE_API_URL=http://127.0.0.1:8000/api/score > .env.local
npm install
npm run dev
# open http://localhost:5173
```


---
🧪 Try a request (Swagger → POST /api/score)
```
{
  "loan_amnt": 200000,
  "int_rate": 12.5,
  "dti": 18,
  "annual_inc": 420000,
  "term": 36,
  "grade": "B",
  "revol_util": 45,
  "delinq_2yrs": 0,
  "open_acc": 6
}
```

You’ll get:
```
{ "pd": 0.23, "feats": [ {"name":"int_rate","value":...}, ... ], "model_version":"real-lightgbm" }
```


---
☁️ Deploy (Render / Railway) — Single URL

Root directory: api

Build: pip install -r requirements.txt

Start: uvicorn main:app --host 0.0.0.0 --port $PORT

Because the React build is copied into api/static/ and model.txt is present in api/models/, one service serves both UI and API. Share that URL with users.

🔐 Public repo? If the model is sensitive, remove it from git and download it at startup instead.


---

🧰 For beginners: 60-second glossary

PD (Probability of Default): probability a borrower misses payments in a time window.
LightGBM: fast tree-based ML model; great for tabular data.
SHAP: method to explain “which features pushed the score up/down”.
FastAPI: web framework to expose your model as a REST API.
Vite/React: frontend that calls the API and renders results.
CORS: browser safety rule; matters only if UI and API run on different domains.


---

🩺 Health / Troubleshooting

Health: add this to api/main.py if needed:
```
@app.get("/health", include_in_schema=False)
def health(): return {"ok": True}
```

PowerShell won’t activate venv:
```
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

- /docs won’t open: ensure Uvicorn is running and not closed.
- Node warning: use Node 20.19+ or 22.12+.
- Split hosting CORS: add your frontend origin in main.py’s CORS allow_origins.


---

✅ CI

On each push, CI installs API deps and builds the frontend.
Status:

[![CI](https://img.shields.io/github/actions/workflow/status/10-kp/SME-Credit-Risk-ML/ci.yml?branch=main&label=CI&logo=github)](https://github.com/10-kp/SME-Credit-Risk-ML/actions/workflows/ci.yml)



---

📜 License

MIT — use freely, improve boldly ✨
```
If you want, I can also drop in **two small screenshots placeholders** section and a **“Deploy to Render”** paragraph with step-by-step clicks.
```



