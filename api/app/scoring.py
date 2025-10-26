from math import exp
from .rules import SECTOR_FACTORS, BANDS, PRODUCT_TEMPLATES

def sigmoid(x: float) -> float:
    return 1 / (1 + exp(-x))

def score_pd(revenue, ebitda, dscr, leverage, sector):
    margin = (ebitda / revenue) if revenue > 0 else 0.0
    sector_w = SECTOR_FACTORS.get(str(sector).lower(), 0.20)
    linear = -3.2 + (-0.9 * dscr) + (0.5 * leverage) + (-1.1 * margin) + sector_w
    pd = sigmoid(linear)
    contribs = {
        "DSCR": -0.9 * dscr,
        "Leverage": 0.5 * leverage,
        "EBITDA margin": -1.1 * margin,
        "Sector": sector_w,
    }
    return pd, contribs

def band_from_pd(pd: float) -> str:
    for name, lo, hi in BANDS:
        if lo <= pd < hi:
            return name
    return "red"

def recommendations(band: str, bank_limits: float):
    tpl = PRODUCT_TEMPLATES.get(band, PRODUCT_TEMPLATES["red"])
    return [
        {"product": p, "tenor_months": t, "limit": round(bank_limits * share, 2)}
        for (p, t, share) in tpl
    ]

def top3(contribs: dict[str, float]):
    ordered = sorted(contribs.items(), key=lambda kv: abs(kv[1]), reverse=True)[:3]
    total = sum(abs(v) for _, v in ordered) or 1.0
    return [{"label": k, "contribution": round(v / total, 2)} for k, v in ordered]
