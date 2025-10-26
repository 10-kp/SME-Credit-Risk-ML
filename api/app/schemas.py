from pydantic import BaseModel, conint, confloat

class ScoreRequest(BaseModel):
    revenue: confloat(ge=0)
    ebitda: float
    dscr: confloat(ge=0)
    leverage: confloat(ge=0)
    bank_limits: confloat(ge=0)
    tenor_months: conint(ge=1, le=120)
    sector: str

class Recommendation(BaseModel):
    product: str
    tenor_months: int
    limit: float

class Driver(BaseModel):
    label: str
    contribution: float

class ScoreResponse(BaseModel):
    pd_pct: float
    risk_band: str
    recommendations: list[Recommendation]
    top_drivers: list[Driver]
    notes: str = "rules:v1"
