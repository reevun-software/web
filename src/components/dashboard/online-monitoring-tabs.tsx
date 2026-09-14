"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { OnlineProjectData } from "@/lib/online-monitoring";

type Project = {
  key: string;
  label: string;
  data: OnlineProjectData | null;
};

export function OnlineMonitoringTabs({
  projects,
  current,
  peakToday,
  peakAllTime,
  unavailable,
}: {
  projects: Project[];
  current: string;
  peakToday: string;
  peakAllTime: string;
  unavailable: string;
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
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <Card key={s.label} className="flex flex-col gap-1 p-5">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="text-2xl font-semibold tracking-tight">
                  {s.value != null ? s.value.toLocaleString() : "—"}
                </span>
              </Card>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.cities.map((c) => (
              <Card key={c.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  {c.players.toLocaleString()}
                  {c.online !== false && (
                    <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  )}
                </span>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
