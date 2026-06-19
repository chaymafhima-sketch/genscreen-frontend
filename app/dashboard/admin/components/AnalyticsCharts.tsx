"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/dictionaries/LanguageContext";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

interface Overview {
  byType: { name: string; value: number }[];
  contentsOverTime: { month: string; count: number }[];
  topScreens: { name: string; count: number }[];
}

const PALETTE = ["#6366f1", "#15803d", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7"];

export default function AnalyticsCharts() {
  const { t } = useLanguage();
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/backend/analytics/overview", {
          cache: "no-store",
        });
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    })();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Contenus par type */}
      <ChartCard title={t.analytics.by_type}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data?.byType ?? []}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
            >
              {(data?.byType ?? []).map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 2. Contenus créés par mois */}
      <ChartCard title={t.analytics.over_time}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data?.contentsOverTime ?? []}>
            <defs>
              <linearGradient id="grad-content" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
            <XAxis dataKey="month" stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#grad-content)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 3. Top écrans */}
      <ChartCard title={t.analytics.top_screens}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data?.topScreens ?? []}
            layout="vertical"
            margin={{ left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
            <XAxis type="number" stroke="#888" fontSize={12} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#888"
              fontSize={12}
              width={90}
            />
            <Tooltip />
            <Bar dataKey="count" fill="#15803d" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}
