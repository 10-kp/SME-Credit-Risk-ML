import React from "react";
import { ScoreResponse } from "./types";

const badgeStyle = (band?: string) => {
  const base: React.CSSProperties = { padding: "4px 10px", borderRadius: 999, fontWeight: 600, fontSize: 12 };
  if (band === "green") return { ...base, background: "#E6F7E9", color: "#137333" };
  if (band === "amber") return { ...base, background: "#FFF7D6", color: "#8a6d00" };
  return { ...base, background: "#FDE8E8", color: "#9b1c1c" };
};

export default function ResultsCard({ data }: { data: ScoreResponse }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Risk Summary</h3>
        <span style={badgeStyle(data.risk_band)}>{String(data.risk_band || "").toUpperCase()}</span>
      </div>
      <p style={{ fontSize: 28, fontWeight: 700, marginTop: 0 }}>PD: {data.pd_pct}%</p>

      {data.top_drivers && (
        <div style={{ marginBottom: 8 }}>
          <h4 style={{ margin: "8px 0" }}>Top drivers</h4>
          <ul>
            {data.top_drivers.map((d, i) => (
              <li key={i}>
                {d.label} ({d.contribution > 0 ? "+" : ""}{d.contribution})
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.recommendations && (
        <div>
          <h4 style={{ margin: "8px 0" }}>Recommended mix</h4>
          <ul>
            {data.recommendations.map((r, i) => (
              <li key={i}>{r.product}: {r.tenor_months} mo, AED {r.limit.toLocaleString()}</li>
            ))}
          </ul>
        </div>
      )}

      {data.notes && <p style={{ color: "#6b7280", fontSize: 12 }}>{data.notes}</p>}
    </div>
  );
}
