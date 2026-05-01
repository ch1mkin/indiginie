"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Row = { id: string; created_at: string; [key: string]: unknown };
type Service = { id: string; title: string };

type Props = {
  services: Service[];
  users: Row[];
  requests: Row[];
  callbacks: Row[];
  tickets: Row[];
  documents: Row[];
};

const durationOptions = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "1Y", value: 365 },
];

function cutoffDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function inDuration<T extends Row>(rows: T[], days: number) {
  const cut = cutoffDate(days).getTime();
  return rows.filter((r) => new Date(r.created_at).getTime() >= cut);
}

export function AdminAnalyticsPanel({ services, users, requests, callbacks, tickets, documents }: Props) {
  const [duration, setDuration] = useState(30);

  const filtered = useMemo(() => {
    const usersF = inDuration(users, duration);
    const requestsF = inDuration(requests, duration);
    const callbacksF = inDuration(callbacks, duration);
    const ticketsF = inDuration(tickets, duration);
    const docsF = inDuration(documents, duration);
    return { usersF, requestsF, callbacksF, ticketsF, docsF };
  }, [callbacks, documents, duration, requests, tickets, users]);

  const serviceUsage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const req of filtered.requestsF) {
      const sid = String(req.service_id ?? "");
      counts.set(sid, (counts.get(sid) ?? 0) + 1);
    }
    return services
      .map((s) => ({ label: s.title, value: counts.get(s.id) ?? 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered.requestsF, services]);

  const dailyTrend = useMemo(() => {
    const points: Array<{ label: string; users: number; requests: number }> = [];
    for (let i = duration - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const usersCount = filtered.usersF.filter((x) => x.created_at.slice(0, 10) === key).length;
      const reqCount = filtered.requestsF.filter((x) => x.created_at.slice(0, 10) === key).length;
      points.push({ label: key.slice(5), users: usersCount, requests: reqCount });
    }
    return points;
  }, [duration, filtered.requestsF, filtered.usersF]);

  const maxBar = Math.max(...serviceUsage.map((x) => x.value), 1);
  const maxTrend = Math.max(...dailyTrend.map((x) => Math.max(x.users, x.requests)), 1);

  const pathFor = (field: "users" | "requests") => {
    if (dailyTrend.length === 0) return "";
    return dailyTrend
      .map((p, i) => {
        const x = (i / Math.max(dailyTrend.length - 1, 1)) * 100;
        const y = 100 - (p[field] / maxTrend) * 100;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  function exportExcel() {
    const workbook = XLSX.utils.book_new();
    const summary = [
      ["Duration (days)", duration],
      ["Users", filtered.usersF.length],
      ["Requests", filtered.requestsF.length],
      ["Callbacks", filtered.callbacksF.length],
      ["Tickets", filtered.ticketsF.length],
      ["Documents", filtered.docsF.length],
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summary), "Summary");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(serviceUsage), "Service Usage");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dailyTrend), "Daily Trend");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(filtered.requestsF), "Requests");
    XLSX.writeFile(workbook, `indiginie-analytics-${duration}d.xlsx`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border bg-white p-1">
          {durationOptions.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDuration(d.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold ${duration === d.value ? "bg-primary text-white" : "text-muted-foreground"}`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <Button onClick={exportExcel}>Export Excel</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Interactive Daily Trend</CardTitle>
            <CardDescription>Users vs requests in selected duration.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-slate-50 p-4">
              <svg viewBox="0 0 100 100" className="h-56 w-full">
                <path d={pathFor("users")} fill="none" stroke="#0284c7" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                <path
                  d={pathFor("requests")}
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="mt-3 flex gap-4 text-xs">
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full bg-sky-600" /> Users
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full bg-blue-800" /> Requests
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
            <CardDescription>Live numbers for selected duration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Users: {filtered.usersF.length}</p>
            <p>Requests: {filtered.requestsF.length}</p>
            <p>Callbacks: {filtered.callbacksF.length}</p>
            <p>Tickets: {filtered.ticketsF.length}</p>
            <p>Documents: {filtered.docsF.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Usage</CardTitle>
          <CardDescription>Top service demand in selected duration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {serviceUsage.map((x) => (
            <div key={x.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{x.label}</span>
                <span>{x.value}</span>
              </div>
              <div className="h-2 rounded bg-muted">
                <div className="h-2 rounded bg-primary transition-all" style={{ width: `${Math.max(8, (x.value / maxBar) * 100)}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
