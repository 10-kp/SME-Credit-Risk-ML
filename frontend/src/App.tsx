import React, { useMemo, useState } from "react";
import { TrendingDown } from "lucide-react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";

// Use the real backend:
const API_URL = import.meta.env.VITE_API_URL || "/api/score";

type Form = {
  loan_amnt?: number;
  int_rate?: number;
  dti?: number;
  annual_inc?: number;
  term?: number;          // 36 or 60
  grade?: "A"|"B"|"C"|"D"|"E"|"F"|"G";
  revol_util?: number;
  delinq_2yrs?: number;
  open_acc?: number;
};

type Result = {
  pd: number;
  feats: { name: string; value: number }[];
  model_version?: string;
};

function sigmoid(x:number){ return 1/(1+Math.exp(-x)); }

// Lightweight mock model so the app works instantly (replace with API when ready)
function mockScore(payload: Form): Result {
  const w: any = {
    intercept: -2.0,
    int_rate: 0.15,
    dti: 0.04,
    annual_inc: -0.000002,
    term: 0.2, // 60 months riskier
    grade: 0.18, // worse grade → higher risk
    revol_util: 0.01,
    delinq_2yrs: 0.25,
    open_acc: -0.02,
    loan_amnt: 0.000002,
  };
  const gradeMap: any = { A:0, B:1, C:2, D:3, E:4, F:5, G:6 };
  const x =
    w.intercept +
    w.int_rate * (payload.int_rate || 0) +
    w.dti * (payload.dti || 0) +
    w.annual_inc * (payload.annual_inc || 0) +
    w.term * ((payload.term || 36) === 60 ? 1 : 0) +
    w.grade * gradeMap[payload.grade || "B"] +
    w.revol_util * (payload.revol_util || 0) +
    w.delinq_2yrs * (payload.delinq_2yrs || 0) +
    w.open_acc * (payload.open_acc || 0) +
    w.loan_amnt * (payload.loan_amnt || 0);

  const pd = sigmoid(x);

  const featsRaw = [
    { name: "Interest rate (%)", value: Math.abs(w.int_rate * (payload.int_rate || 0)) },
    { name: "Debt-to-income (%)", value: Math.abs(w.dti * (payload.dti || 0)) },
    { name: "Term (60m flag)", value: Math.abs(w.term * ((payload.term || 36) === 60 ? 1 : 0)) },
    { name: "Grade (A→G)", value: Math.abs(w.grade * gradeMap[payload.grade || "B"]) },
    { name: "Revolving util (%)", value: Math.abs(w.revol_util * (payload.revol_util || 0)) },
    { name: "Annual income (AED)", value: Math.abs(w.annual_inc * (payload.annual_inc || 0)) },
    { name: "Delinq in 2 yrs", value: Math.abs(w.delinq_2yrs * (payload.delinq_2yrs || 0)) },
    { name: "Open accounts", value: Math.abs(w.open_acc * (payload.open_acc || 0)) },
    { name: "Loan amount (AED)", value: Math.abs(w.loan_amnt * (payload.loan_amnt || 0)) },
  ].sort((a, b) => b.value - a.value);

  return { pd, feats: featsRaw.slice(0, 7), model_version: "demo-0.1" };
}

function PricingHint({ pd }: { pd: number }) {
  const base = 6.0; // AED interbank proxy (illustrative)
  const spread = pd < 0.03 ? 3 : pd < 0.07 ? 4.5 : pd < 0.12 ? 6.5 : pd < 0.20 ? 9 : 12;
  const rate = (base + spread).toFixed(1);
  const text =
    pd < 0.07
      ? "Prime clients / low expected loss"
      : pd < 0.12
      ? "Standard book with controls"
      : pd < 0.20
      ? "Heightened monitoring"
      : "Consider collateral / covenants";
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <TrendingDown size={18} style={{ marginTop: 2 }} />
      <div>
        <div style={{ fontSize: 14 }}>
          Suggested all-in rate (illustrative): <strong>{rate}%</strong>
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          {text}. Calibrate with RAROC and pricing committee.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState<Form>({ term: 36, grade: "B" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const risk = useMemo(() => {
    if (!result) return null;
    const p = result.pd;
    if (p < 0.03) return { label: "A (Low)", color: "#22c55e" };
    if (p < 0.07) return { label: "B (Mod-Low)", color: "#84cc16" };
    if (p < 0.12) return { label: "C (Moderate)", color: "#eab308" };
    if (p < 0.20) return { label: "D (High)", color: "#f97316" };
    return { label: "E (Very High)", color: "#ef4444" };
  }, [result]);

  const featureData = useMemo(
    () => (result ? result.feats.map((f) => ({ name: f.name, value: Number(f.value.toFixed(4)) })) : []),
    [result]
  );

  async function onScore() {
    setError(null);
    setLoading(true);
    try {
      if (API_URL) {
        const resp = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!resp.ok) throw new Error(`API error ${resp.status}`);
        const out: Result = await resp.json();
        setResult(out);
      } else {
        // offline / demo
        await new Promise((r) => setTimeout(r, 400));
        setResult(mockScore(form));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to score");
    } finally {
      setLoading(false);
    }
  }

  function field(
    label: string,
    input: React.ReactNode
  ) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 8, alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "#555" }}>{label}</div>
        <div>{input}</div>
      </div>
    );
  }

  const wrap: React.CSSProperties = { maxWidth: 1100, margin: "24px auto", padding: "0 16px" };
  const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#fff" };
  const heading: React.CSSProperties = { fontSize: 20, fontWeight: 600, marginBottom: 8 };

  return (
    <div style={{ background: "#f7f7fb", minHeight: "100vh" }}>
      <div style={wrap}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>SME Credit Risk Scoring</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              End-user demo. Works offline (mock) or via your FastAPI at <code>/api/score</code>.
            </div>
          </div>
        </header>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
          {/* Left: Inputs */}
          <div style={card}>
            <div style={heading}>Borrower Inputs</div>
            <div style={{ display: "grid", gap: 10 }}>
              {field(
                "Loan amount (AED)",
                <input
                  type="number"
                  placeholder="200000"
                  value={form.loan_amnt ?? ""}
                  onChange={(e) => setForm({ ...form, loan_amnt: Number(e.target.value) })}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
                />
              )}
              {field(
                "Interest rate (%)",
                <input
                  type="number"
                  step="0.01"
                  placeholder="12.5"
                  value={form.int_rate ?? ""}
                  onChange={(e) => setForm({ ...form, int_rate: Number(e.target.value) })}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
                />
              )}
              {field(
                "Debt-to-income (DTI, %)",
                <input
                  type="number"
                  step="0.1"
                  placeholder="18"
                  value={form.dti ?? ""}
                  onChange={(e) => setForm({ ...form, dti: Number(e.target.value) })}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
                />
              )}
              {field(
                "Annual income (AED)",
                <input
                  type="number"
                  placeholder="420000"
                  value={form.annual_inc ?? ""}
                  onChange={(e) => setForm({ ...form, annual_inc: Number(e.target.value) })}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
                />
              )}
              {field(
                "Term",
                <select
                  value={String(form.term ?? 36)}
                  onChange={(e) => setForm({ ...form, term: Number(e.target.value) })}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
                >
                  <option value="36">36 months</option>
                  <option value="60">60 months</option>
                </select>
              )}
              {field(
                "Grade (A best → G worst)",
                <select
                  value={form.grade ?? "B"}
                  onChange={(e) => setForm({ ...form, grade: e.target.value as any })}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
                >
                  {["A", "B", "C", "D", "E", "F", "G"].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              )}
              {field(
                "Revolving utilization (%)",
                <input
                  type="number"
                  step="0.1"
                  placeholder="45"
                  value={form.revol_util ?? ""}
                  onChange={(e) => setForm({ ...form, revol_util: Number(e.target.value) })}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
                />
              )}
              {field(
                "Delinquencies (2 yrs)",
                <input
                  type="number"
                  placeholder="0"
                  value={form.delinq_2yrs ?? ""}
                  onChange={(e) => setForm({ ...form, delinq_2yrs: Number(e.target.value) })}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
                />
              )}
              {field(
                "Open accounts",
                <input
                  type="number"
                  placeholder="6"
                  value={form.open_acc ?? ""}
                  onChange={(e) => setForm({ ...form, open_acc: Number(e.target.value) })}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
                />
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button
                onClick={onScore}
                disabled={loading}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "#111827",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {loading ? "Scoring..." : "Score application"}
              </button>
              <button
                onClick={() => {
                  setForm({ term: 36, grade: "B" });
                  setResult(null);
                  setError(null);
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>

            {error && <div style={{ color: "#b91c1c", marginTop: 8, fontSize: 13 }}>{error}</div>}
            <div style={{ fontSize: 11, color: "#666", marginTop: 8 }}>
              Note: Demo uses a placeholder model. Point API_URL to your FastAPI for production.
            </div>
          </div>

          {/* Right: Result */}
          <div style={card}>
            <div style={heading}>Risk Result & Explanation</div>
            {!result && (
              <div style={{ fontSize: 14, color: "#666" }}>
                Enter inputs and click <strong>Score application</strong> to see PD, risk tier, drivers and pricing hint.
              </div>
            )}

            {result && (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 12, color: "#666" }}>Predicted Default Probability (PD)</div>
                    <div style={{ fontSize: 28, fontWeight: 600 }}>{(result.pd * 100).toFixed(2)}%</div>
                  </div>
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 12, color: "#666" }}>Risk Tier</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 10,
                          height: 10,
                          borderRadius: "999px",
                          background: risk?.color || "#ccc",
                        }}
                      />
                      <span style={{ fontSize: 18, fontWeight: 500 }}>{risk?.label}</span>
                    </div>
                  </div>
                </div>

                <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                    Top drivers (higher bar = stronger impact)
                  </div>
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={featureData} layout="vertical" margin={{ left: 16, right: 16 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={180} />
                        <Tooltip formatter={(v) => [v as number, "impact"]} />
                        <Bar dataKey="value" radius={[4, 4, 4, 4]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                    Indicative pricing guidance (illustrative)
                  </div>
                  <PricingHint pd={result.pd} />
                </div>

                <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Audit trail</div>
                  <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13 }}>
                    <li>Inputs validated on client.</li>
                    <li>Model version: <code>{result.model_version || "demo-0.1"}</code></li>
                    <li>Timestamp: {new Date().toLocaleString()}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#666" }}>
          Built for bankers: explainable, fast, production-ready. Swap to API when ready.
        </footer>
      </div>
    </div>
  );
}
