from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
# (optional but recommended)
from slowapi.middleware import SlowAPIMiddleware

from .schemas import ScoreRequest, ScoreResponse
from .scoring import score_pd, band_from_pd, recommendations, top3
from .auth import (
    OAuth2PasswordRequestForm,  # type: ignore
    authenticate_user,
    create_access_token,
    get_current_user,
    Token,
)

app = FastAPI(title="Scoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["POST","GET","OPTIONS"],
    allow_headers=["Authorization","Content-Type"],
)

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["5/minute"])
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)  # optional but helps ensure request state

@app.exception_handler(RateLimitExceeded)
def ratelimit_handler(request, exc):
    return limiter._rate_limit_exceeded_handler(request, exc)

@app.get("/healthz")
def healthz():
    return {"ok": True}

# ---- AUTH ----
@app.post("/auth/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, form: OAuth2PasswordRequestForm = Depends()):
    if not authenticate_user(form.username, form.password):
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(sub=form.username)
    return {"access_token": token, "token_type": "bearer"}

# ---- PROTECTED SCORING ----
@app.post("/score", response_model=ScoreResponse)
@limiter.limit("5/minute")
def score(request: Request, payload: ScoreRequest, user: str = Depends(get_current_user)):
    pd, contribs = score_pd(payload.revenue, payload.ebitda, payload.dscr, payload.leverage, payload.sector)
    band = band_from_pd(pd)
    recs = recommendations(band, payload.bank_limits)
    return ScoreResponse(
        pd_pct=round(pd * 100, 2),
        risk_band=band,
        recommendations=recs,
        top_drivers=top3(contribs),
        notes="rules:v1",
    )

# ---- DEMO (no auth) ----
@app.post("/demo/score", response_model=ScoreResponse)
@limiter.limit("5/minute")
def demo_score(request: Request, payload: ScoreRequest):
    pd, contribs = score_pd(payload.revenue, payload.ebitda, payload.dscr, payload.leverage, payload.sector)
    band = band_from_pd(pd)
    recs = recommendations(band, payload.bank_limits)
    return ScoreResponse(
        pd_pct=round(pd * 100, 2),
        risk_band=band,
        recommendations=recs,
        top_drivers=top3(contribs),
        notes="demo:rules:v1",
    )
