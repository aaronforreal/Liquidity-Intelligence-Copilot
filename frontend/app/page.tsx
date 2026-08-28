"use client";

import { useEffect, useState } from "react";
import { Governance } from "@/components/governance";
import { BookOpen, CircleGauge, LayoutDashboard, ShieldCheck, TriangleAlert } from "@/components/icons";
import { Investigation } from "@/components/investigation";
import { LcrChart } from "@/components/lcr-chart";
import { MetricCard } from "@/components/metric-card";
import { demoData } from "@/lib/demo-data";
import type { DashboardData } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Home() {
  const [data, setData] = useState<DashboardData>(demoData);

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard`)
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json();
      })
      .then((payload: DashboardData) => setData(payload))
      .catch(() => undefined);
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top"><span className="brand-mark">L</span><span>Liquidity<b>Lens</b></span></a>
        <nav>
          <a className="active" href="#top"><LayoutDashboard size={17} /> Overview</a>
          <a href="#investigation"><CircleGauge size={17} /> Investigation</a>
          <a href="#investigation"><BookOpen size={17} /> Evidence</a>
          <a href="#governance"><ShieldCheck size={17} /> AI governance</a>
        </nav>
      </aside>

      <main id="top">
        <header className="topbar">
          <div><span className="eyebrow">Liquidity risk oversight</span><h1>Good morning, Analyst.</h1><p>Here’s what changed across the liquidity position.</p></div>
        </header>

        <section className="metrics-grid">
          {data.metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
        </section>

        <section className="overview-grid">
          <article className="trend-panel">
            <div className="panel-title"><div><span>Liquidity coverage ratio</span><small>Trailing 35 days</small></div><div className="legend"><span /> Daily LCR</div></div>
            <LcrChart history={data.history} />
          </article>
          <article className="alert-panel">
            <div className="alert-top"><span><TriangleAlert size={18} /></span><div><small>{data.alert.severity} priority</small><strong>Liquidity alert</strong></div></div>
            <h2>{data.alert.title}</h2>
            <p>{data.alert.message}</p>
            <div className="alert-stat"><span>Observed deviation</span><strong>{data.alert.z_score.toFixed(1)}σ</strong></div>
            <a href="#investigation">Open investigation <span>→</span></a>
          </article>
        </section>

        <Investigation data={data} />
        <Governance data={data} />

        <footer><span><span className="brand-mark small">L</span> LiquidityLens</span></footer>
      </main>
    </div>
  );
}
