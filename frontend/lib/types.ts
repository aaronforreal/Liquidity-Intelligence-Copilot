export type Metric = {
  label: string;
  value: number;
  unit: string;
  change: number | null;
  status: "healthy" | "watch" | "critical";
};

export type HistoryPoint = { date: string; lcr: number; hqla: number; outflows: number };
export type Contribution = { driver: string; impact: number; detail: string };
export type Evidence = {
  id: string;
  type: "calculation" | "regulation" | "disclosure";
  title: string;
  excerpt: string;
  source: string;
};

export type DashboardData = {
  as_of: string;
  metrics: Metric[];
  history: HistoryPoint[];
  alert: { severity: "high" | "medium" | "low"; title: string; message: string; z_score: number };
  contributions: Contribution[];
  explanation: string;
  evidence: Evidence[];
  audit: {
    request_id: string;
    generated_at: string;
    engine_version: string;
    data_classification: string;
    review_status: string;
  };
};

export type ScenarioResult = {
  baseline_lcr: number;
  stressed_lcr: number;
  impact: number;
  additional_outflows: number;
  explanation: string;
  formula: string;
};
