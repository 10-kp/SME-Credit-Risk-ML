# SME Credit Risk: From Raw Data to Explainable API

An end-to-end pipeline to score SME loans using **LightGBM**, explain with **SHAP**, track with **MLflow**, and serve via **FastAPI** — optimized for low-RAM environments using **DuckDB** and efficient categorical handling.

## Why this project (Banking × AI)
As a corporate banker upskilling in Data Science:
- **Risk insight** → Estimate Probability of Default (PD) beyond static scorecards
- **Explainability** → SHAP highlights drivers (`int_rate`, `dti`, `grade`) for governance & client trust
- **Ops-ready** → MLflow model tracking; FastAPI endpoint for real-time scoring

## Pipeline
1. Ingest with DuckDB (column subset, row cap)
2. Prep: cast text→`category`, encode categoricals (CountEncoder)
3. Train: LightGBM with early stopping (AUC baseline ~0.70)
4. Explain: SHAP summary plot
5. Track: MLflow (params, metrics, model)
6. Serve: FastAPI `/score` endpoint returning `{ "pd": ..., "decision": ... }`

## Quickstart
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Train / explain / serve scripts (or run the notebook in notebooks/)
