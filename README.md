# SME Credit Risk: Explainable ML Pipeline + Chat UI

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Node](https://img.shields.io/badge/Node.js-20.19%2B%20or%2022.12%2B-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-teal.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Vite%20%2B%20Tailwind-lightblue.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 About

Explainable SME Credit Risk Scoring — **LightGBM + SHAP + MLflow + FastAPI**, bridging corporate banking expertise with AI.  

This repository combines:
- An **ML pipeline** to estimate SME loan default probability (PD).  
- A **chat interface** (FastAPI + React) to interact with models and explanations in real time.  

---

## 🏦 Why this project (Banking × AI)

- **Risk insight** → Estimate Probability of Default (PD) beyond static scorecards  
- **Explainability** → SHAP highlights drivers (`int_rate`, `dti`, `grade`) for governance & client trust  
- **Ops-ready** → MLflow model tracking; FastAPI endpoints for real-time scoring  

---

## 📂 Repository Layout

```
SME-Credit-Risk-ML/
├─ notebooks/ # CAAS.ipynb, experiments
├─ api/
│ └─ chat/ # FastAPI backend
│ ├─ main.py
│ ├─ llm.py
│ ├─ requirements.txt
│ └─ artifacts/ # export model.pkl, shap.pkl here
├─ frontend/ # React + Tailwind chat UI
│ ├─ src/ChatCaas.tsx
│ ├─ src/main.tsx
│ ├─ vite.config.ts
│ └─ package.json
└─ README.md
```

---

## 🔄 ML Pipeline (Core)

**Steps**
1. Ingest: DuckDB (subset columns, cap rows)  
2. Prep: cast text→category, CountEncoder for categoricals  
3. Train: LightGBM (AUC baseline ~0.70)  
4. Explain: SHAP summary plots  
5. Track: MLflow (params, metrics, artifacts)  
6. Serve: FastAPI `/score` endpoint  

**Quickstart**
```powershell
python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
jupyter notebook notebooks/CAAS.ipynb
```

---
💬 Chat App (FastAPI + React)

Interactive chat interface with SSE streaming.

Backend: FastAPI (api/chat/)

Frontend: React + Vite + Tailwind (frontend/)

Modes: Echo fallback (no API key) or OpenAI integration


Backend
```powershell
cd SME-Credit-Risk-ML
.\.venv\Scripts\Activate.ps1
pip install -r api\chat\requirements.txt
uvicorn api.chat.main:app --reload
```

Check health: http://127.0.0.1:8000/api/health


Frontend
cd frontend

npm install

npm run dev


Open http://localhost:5173

---

📊 Using the CAAS Model with Chat


From notebook after training:

```powershell
import os, joblib
os.makedirs("../api/chat/artifacts", exist_ok=True)
joblib.dump(lgbm_model, "../api/chat/artifacts/model.pkl")
joblib.dump(shap_explainer, "../api/chat/artifacts/shap.pkl")
```

Then extend backend with:

POST /api/score → returns PD/probabilities

POST /api/explain → returns top SHAP drivers


---

🛠️ Troubleshooting

PowerShell blocks venv activation

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Uvicorn import error → run from repo root

```powershell
uvicorn api.chat.main:app --reload
```

Node.js version too low → upgrade via nvm

```powershell
nvm install 22.12.0 && nvm use 22.12.0
```
