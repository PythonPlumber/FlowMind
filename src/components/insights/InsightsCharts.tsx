"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function InsightsCharts(props:
  | { kind: "cycle" | "period"; data: Array<{ date: string; length: number }> }
  | { kind: "mood"; data: Array<{ date: string; mood: number }> }
  | { kind: "symptoms"; data: Array<{ label: string; count: number }> }
) {
  if (props.data.length === 0) {
    return (
      <p className="text-sm text-[color:var(--ink-soft)]">
        Not enough data yet. Keep logging and come back later.
      </p>
    );
  }

  if (props.kind === "symptoms") {
    return (
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={props.data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid stroke="rgba(111,93,87,0.18)" vertical={false} />
            <XAxis dataKey="label" interval={0} angle={-25} textAnchor="end" height={70} />
            <YAxis allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.55)",
                background: "rgba(255,251,247,0.95)",
                boxShadow: "0 20px 40px rgba(83,37,48,0.12)",
              }}
            />
            <Bar dataKey="count" fill="#8e2748" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (props.kind === "mood") {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={props.data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid stroke="rgba(111,93,87,0.18)" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.55)",
                background: "rgba(255,251,247,0.95)",
                boxShadow: "0 20px 40px rgba(83,37,48,0.12)",
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#597c66"
              strokeWidth={3}
              dot={{ r: 3, fill: "#597c66" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={props.data} margin={{ left: 8, right: 8 }}>
          <CartesianGrid stroke="rgba(111,93,87,0.18)" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.55)",
              background: "rgba(255,251,247,0.95)",
              boxShadow: "0 20px 40px rgba(83,37,48,0.12)",
            }}
          />
          <Line
            type="monotone"
            dataKey="length"
            stroke="#8e2748"
            strokeWidth={3}
            dot={{ r: 3, fill: "#8e2748" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
