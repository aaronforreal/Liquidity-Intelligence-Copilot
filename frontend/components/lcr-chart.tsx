"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoryPoint } from "@/lib/types";

function TooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span>{new Date(`${label}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</span>
      <strong>{payload[0].value.toFixed(1)}% LCR</strong>
    </div>
  );
}

export function LcrChart({ history }: { history: HistoryPoint[] }) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="lcrFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d89b57" stopOpacity={0.26} />
              <stop offset="100%" stopColor="#d89b57" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e5e1d8" strokeDasharray="3 4" />
          <XAxis dataKey="date" tickFormatter={(value) => new Date(`${value}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" })} axisLine={false} tickLine={false} tick={{ fill: "#8a867e", fontSize: 11 }} minTickGap={35} />
          <YAxis domain={[98, 132]} axisLine={false} tickLine={false} tick={{ fill: "#8a867e", fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
          <ReferenceLine y={100} stroke="#b8584f" strokeDasharray="5 4" label={{ value: "Illustrative minimum", position: "insideBottomLeft", fill: "#9b5149", fontSize: 10 }} />
          <Tooltip content={<TooltipContent />} />
          <Area type="monotone" dataKey="lcr" stroke="#a9672f" strokeWidth={2.5} fill="url(#lcrFill)" activeDot={{ r: 5, fill: "#fff", stroke: "#a9672f", strokeWidth: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
