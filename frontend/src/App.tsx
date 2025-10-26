import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login, score } from "./api";
import ResultsCard from "./ResultsCard";

import { ScoreResponse } from "./types";


const FormSchema = z.object({
  revenue: z.number({ invalid_type_error: "Required" }).min(0, "Must be >= 0"),
  ebitda: z.number({ invalid_type_error: "Required" }),
  dscr: z.number({ invalid_type_error: "Required" }).min(0, "Must be >= 0"),
  leverage: z.number({ invalid_type_error: "Required" }).min(0, "Must be >= 0"),
  bank_limits: z.number({ invalid_type_error: "Required" }).min(0, "Must be >= 0"),
  tenor_months: z.number({ invalid_type_error: "Required" }).int().min(1).max(120),
  sector: z.enum(["manufacturing","services","trading","construction","hospitality","logistics","agri"]),
});
type FormValues = z.infer<typeof FormSchema>;

export default function App() {
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const { register, handleSubmit, formState:{errors}, reset } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      revenue: 12000000,
      ebitda: 1800000,
      dscr: 1.8,
      leverage: 2.5,
      bank_limits: 5000000,
      tenor_months: 24,
      sector: "manufacturing",
    }
  });

  const onSubmit = async (values: FormValues) => {
  try {
    // if not signed in, use the demo endpoint automatically
    const useDemo = !localStorage.getItem("token");
    const data = await score(values, { demo: useDemo });
    setResult(data);
  } catch (e: any) {
    console.error("score error", e);
    if (String(e).includes("429")) alert("Too many requests. Please wait a minute.");
    else if (String(e).includes("401")) alert("Not signed in. Click ‘Sign in’ first, or use Quick demo.");
    else alert("Scoring failed. Check DevTools > Network for details.");
  }
};

  const trySample = async () => {
    const sample: FormValues = {
      revenue: 12000000, ebitda: 1800000, dscr: 1.8, leverage: 2.5,
      bank_limits: 5000000, tenor_months: 24, sector: "manufacturing"
    };
    reset(sample);
    const data = await score(sample);
    setResult(data);
  };

  const field = (name: keyof FormValues, label: string, step="any") => (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontWeight: 600 }}>{label}</label>
      <input type="number" step={step} style={{ width:"100%", padding:8, border:"1px solid #e5e7eb", borderRadius:8 }}
        {...register(name, { valueAsNumber: true })} />
      {errors[name] && <div style={{ color:"#b91c1c", fontSize:12 }}>{String(errors[name]?.message || "Invalid")}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>SME Credit Risk — Score</h1>
<div style={{ display:"flex", gap:8, marginBottom:12 }}>
  <button
    type="button"
    onClick={async ()=>{
      const u = prompt("Email","demo@user.test");
      const p = prompt("Password","demo1234");
      if(!u || !p) return;
      try { await login(u,p); alert("Signed in"); }
      catch { alert("Login failed"); }
    }}
    style={{ padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:8 }}
  >
    Sign in
  </button>

  <button
    type="button"
    onClick={async ()=>{
      const sample = {
        revenue:12000000, ebitda:1800000, dscr:1.8, leverage:2.5,
        bank_limits:5000000, tenor_months:24, sector:"manufacturing",
      };
      const data = await score(sample, { demo:true }); // hits /demo/score (no token)
      setResult(data);
    }}
    style={{ padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:8 }}
  >
    Quick demo
  </button>
</div>

      <form onSubmit={handleSubmit(onSubmit, (e)=>console.log("formErrors", e))}>
        {field("revenue", "Revenue (AED)")}
        {field("ebitda", "EBITDA (AED)")}
        {field("dscr", "DSCR")}
        {field("leverage", "Leverage (x)")}
        {field("bank_limits", "Bank Limits Requested (AED)")}
        {field("tenor_months", "Tenor (months)", "1")}
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Sector</label>
          <select style={{ width:"100%", padding:8, border:"1px solid #e5e7eb", borderRadius:8 }} {...register("sector")}>
            {["manufacturing","services","trading","construction","hospitality","logistics","agri"].map(s =>
              <option key={s} value={s}>{s}</option>
            )}
          </select>
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <button type="submit" style={{ padding:"10px 16px", borderRadius:10, background:"#111827", color:"#fff" }}>
            Score
          </button>
          <button type="button" onClick={trySample} style={{ padding:"10px 16px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff" }}>
            Try with sample data
          </button>
        </div>
      </form>

      {result && <ResultsCard data={result} />}
    </div>
  );
}

