import { ArrowDownRight, ArrowUpRight } from "./icons";
import type { Metric } from "@/lib/types";

export function MetricCard({ metric }: { metric: Metric }) {
  const isDown = (metric.change ?? 0) < 0;
  const changeClass = metric.label.includes("outflows") ? (isDown ? "positive" : "negative") : isDown ? "negative" : "positive";

  return (
    <article className={`metric-card ${metric.status === "watch" ? "watch" : ""}`}>
      <div className="metric-label">
        <span>{metric.label}</span>
        <span className={`status-dot ${metric.status}`} aria-label={`${metric.status} status`} />
      </div>
      <div className="metric-value">
        {metric.value.toFixed(1)}<span>{metric.unit}</span>
      </div>
      {metric.change !== null && (
        <div className={`metric-change ${changeClass}`}>
          {isDown ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
          {Math.abs(metric.change).toFixed(1)}{metric.unit} <span>vs. 7 days ago</span>
        </div>
      )}
    </article>
  );
}
