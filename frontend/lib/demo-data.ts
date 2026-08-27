import type { DashboardData } from "./types";

const values = [128.7, 128.4, 128.8, 128.2, 128.6, 128.1, 128.5, 128.2, 128.4, 128.0, 128.3, 127.9, 128.1, 127.8, 128.0, 127.7, 127.9, 127.5, 127.8, 127.4, 127.6, 127.3, 127.5, 127.1, 127.4, 127.0, 127.2, 126.9, 127.1, 126.8, 126.6, 126.3, 126.0, 125.8, 123.4];

export const demoData: DashboardData = {
  as_of: "2026-08-26",
  metrics: [
    { label: "Liquidity Coverage Ratio", value: 123.4, unit: "%", change: -4.0, status: "watch" },
    { label: "Net Stable Funding Ratio", value: 117.6, unit: "%", change: -0.3, status: "healthy" },
    { label: "Eligible HQLA", value: 217.6, unit: "$B", change: -2.1, status: "watch" },
    { label: "30-day net outflows", value: 176.3, unit: "$B", change: 4.1, status: "watch" },
  ],
  history: values.map((lcr, index) => ({
    date: new Date(2026, 6, 23 + index).toISOString().slice(0, 10),
    lcr,
    hqla: 222.3 - index * 0.08 - (index === 34 ? 2 : 0),
    outflows: 172 + index * 0.04 + (index === 34 ? 3 : 0),
  })),
  alert: {
    severity: "high",
    title: "Wholesale funding outflow anomaly",
    message: "Stressed wholesale outflows are 2.4σ above the trailing 30-day average.",
    z_score: 2.4,
  },
  contributions: [
    { driver: "Wholesale deposit runoff", impact: -2.1, detail: "Higher stressed wholesale cash outflows" },
    { driver: "Level 1 HQLA", impact: -1.2, detail: "Change in the Level 1 liquid-asset buffer" },
    { driver: "Corporate deposits", impact: -0.9, detail: "Higher stressed corporate deposit outflows" },
    { driver: "Other movements", impact: 0.2, detail: "Retail, secured funding, Level 2 HQLA, and inflows" },
  ],
  explanation: "LCR declined 4.0 percentage points over the week to 123.4%. The primary driver was wholesale deposit runoff (-2.1 pp), accounting for approximately 53% of the movement. Wholesale stressed outflows are 2.4 standard deviations above their trailing 30-day pattern. The ratio remains above the illustrative 100% minimum, but the movement warrants analyst review.",
  evidence: [
    { id: "calc-001", type: "calculation", title: "LCR calculation trace", excerpt: "Eligible HQLA $217.6B ÷ net 30-day outflows $176.3B = 123.4%.", source: "Synthetic position data · lcr-demo-1.0.0" },
    { id: "reg-001", type: "regulation", title: "Liquidity Coverage Ratio requirement", excerpt: "The LCR compares high-quality liquid assets with total net cash outflows over a 30-day stress period.", source: "OSFI Liquidity Adequacy Requirements · public source placeholder" },
    { id: "disc-001", type: "disclosure", title: "Public liquidity disclosure", excerpt: "Large Canadian banks publicly disclose LCR and NSFR as part of liquidity risk reporting.", source: "Public financial disclosure · validate link before publication" },
  ],
  audit: {
    request_id: "demo-8f42c1",
    generated_at: "2026-08-26T17:30:00Z",
    engine_version: "lcr-demo-1.0.0",
    data_classification: "Synthetic / public",
    review_status: "Analyst review required",
  },
};
