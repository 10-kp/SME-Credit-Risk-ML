export type Sector = "manufacturing"|"services"|"trading"|"construction"|"hospitality"|"logistics"|"agri";

export interface ScoreRequest {
  revenue: number;
  ebitda: number;
  dscr: number;
  leverage: number;
  bank_limits: number;
  tenor_months: number;
  sector: Sector;
  demo?: boolean;
}

export interface Driver { label: string; contribution: number; }
export interface Recommendation { product: string; tenor_months: number; limit: number; }

export interface ScoreResponse {
  pd_pct: number;
  risk_band: "green"|"amber"|"red" | string;
  recommendations?: Recommendation[];
  top_drivers?: Driver[];
  notes?: string;
}
