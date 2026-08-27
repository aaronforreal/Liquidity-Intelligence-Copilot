"use client";

import { useState } from "react";
import { Calculator, Check, FileText, FlaskConical, Sparkles } from "./icons";
import type { DashboardData, ScenarioResult } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function Investigation({ data }: { data: DashboardData }) {
  const [shock, setShock] = useState(10);
  const [scenario, setScenario] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  async function runScenario() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/scenarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wholesale_outflow_increase_pct: shock }),
      });
      if (!response.ok) throw new Error("Scenario API unavailable");
      setScenario(await response.json());
    } catch {
      const baseline = data.metrics[0].value;
      const additional = 89.3 * shock / 100;
      const stressed = 217.6 / (176.3 + additional) * 100;
      setScenario({
        baseline_lcr: baseline,
        stressed_lcr: Number(stressed.toFixed(1)),
        impact: Number((stressed - baseline).toFixed(1)),
        additional_outflows: Number(additional.toFixed(1)),
        explanation: `A ${shock}% increase in stressed wholesale outflows adds $${additional.toFixed(1)}B of 30-day outflows and reduces LCR by ${Math.abs(stressed - baseline).toFixed(1)} percentage points.`,
        formula: `$217.6B HQLA ÷ ($176.3B + $${additional.toFixed(1)}B) net outflows`,
      });
    } finally {
      setLoading(false);
    }
  }

  const maxImpact = Math.max(...data.contributions.map((item) => Math.abs(item.impact)));

  return (
    <section className="investigation" id="investigation">
      <div className="section-heading investigation-heading">
        <div>
          <span className="eyebrow"><Sparkles size={13} /> Investigation brief</span>
          <h2>Why did LCR decrease this week?</h2>
        </div>
        <button className={`review-button ${reviewed ? "reviewed" : ""}`} onClick={() => setReviewed(!reviewed)}>
          <Check size={15} /> {reviewed ? "Reviewed by analyst" : "Mark as reviewed"}
        </button>
      </div>

      <div className="investigation-grid">
        <div className="narrative-panel">
          <div className="agent-label"><span className="agent-mark">L</span> LiquidityLens analysis</div>
          <p>{data.explanation}</p>
          <div className="grounding-note"><Check size={14} /> Generated from verified calculation outputs</div>
        </div>

        <div className="bridge-panel">
          <div className="panel-title"><span>7-day LCR movement</span><strong>{data.metrics[0].change?.toFixed(1)} pp</strong></div>
          <div className="contribution-list">
            {data.contributions.map((item) => (
              <div className="contribution" key={item.driver}>
                <div className="contribution-copy"><strong>{item.driver}</strong><span>{item.detail}</span></div>
                <div className="bar-track"><span className={item.impact > 0 ? "bar positive" : "bar"} style={{ width: `${Math.max(8, Math.abs(item.impact) / maxImpact * 100)}%` }} /></div>
                <strong className={item.impact > 0 ? "impact positive" : "impact"}>{item.impact > 0 ? "+" : ""}{item.impact.toFixed(1)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lower-grid">
        <div className="evidence-panel">
          <div className="panel-title"><span>Evidence &amp; calculation trace</span><small>{data.evidence.length} sources</small></div>
          {data.evidence.map((item) => (
            <article className="evidence-item" key={item.id}>
              <span className={`evidence-icon ${item.type}`}>{item.type === "calculation" ? <Calculator size={16} /> : <FileText size={16} />}</span>
              <div><strong>{item.title}</strong><p>{item.excerpt}</p><small>{item.source}</small></div>
            </article>
          ))}
        </div>

        <div className="scenario-panel">
          <div className="panel-title"><span><FlaskConical size={16} /> Stress scenario</span><small>Deterministic</small></div>
          <label htmlFor="shock">Wholesale outflow increase <strong>+{shock}%</strong></label>
          <input id="shock" type="range" min="0" max="30" step="1" value={shock} onChange={(event) => setShock(Number(event.target.value))} />
          <div className="range-labels"><span>0%</span><span>15%</span><span>30%</span></div>
          <button className="primary-button" onClick={runScenario} disabled={loading}>{loading ? "Calculating…" : "Run scenario"}</button>
          {scenario && (
            <div className="scenario-result">
              <div><span>Stressed LCR</span><strong>{scenario.stressed_lcr.toFixed(1)}%</strong><em>{scenario.impact.toFixed(1)} pp</em></div>
              <p>{scenario.explanation}</p>
              <code>{scenario.formula}</code>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
