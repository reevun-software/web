"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnlineHistoryChart } from "@/components/dashboard/online-history-chart";
import type { OnlineProjectData, OnlineHistoryPoint } from "@/lib/online-monitoring";

type Project = {
  key: string;
  label: string;
  data: OnlineProjectData | null;
  history: OnlineHistoryPoint[];
};

export function OnlineMonitoringTabs({
  projects,
  current,
  peakToday,
  peakAllTime,
  unavailable,
  historyEmpty,
}: {
  projects: Project[];
  current: string;
  peakToday: string;
  peakAllTime: string;
  unavailable: string;
  historyEmpty: string;
}) {
  const [active, setActive] = useState(projects[0]?.key);
  const project = projects.find((p) => p.key === active) ?? projects[0];
  const data = project?.data;

  const stats = [
    { label: current, value: data?.totalPlayers },
    { label: peakToday, value: data?.peakToday },
    { label: peakAllTime, value: data?.peakAllTime },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {projects.map((p) => (
          <Button
            key={p.key}
            variant={p.key === active ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => setActive(p.key)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {!data ? (
        <Card className="p-6 text-sm text-muted-foreground">{unavailable}</Card>
      ) : (
        <>
          <Card className="grid grid-cols-1 divide-y divide-border/60 p-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1 px-5 py-4">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  {s.value != null ? s.value.toLocaleString() : "—"}
                </span>
              </div>
            ))}
          </Card>

          <Card className="p-5 text-foreground">
            <OnlineHistoryChart points={project.history} emptyLabel={historyEmpty} />
          </Card>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
            {data.cities.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 bg-card px-4 py-3 transition-colors hover:bg-accent/60"
              >
                <span className="truncate text-sm font-medium">{c.name}</span>
                <span className="flex shrink-0 items-center gap-2 text-sm tabular-nums text-muted-foreground">
                  {c.players.toLocaleString()}
                  {c.online !== false && (
                    <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  )}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
