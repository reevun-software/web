"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export type ProjectCity = { id: string; name: string };

const PROJECT_KEYS = ["majestic", "russiaonline", "gta5rp"] as const;
type ProjectKey = (typeof PROJECT_KEYS)[number];

// Two cascading Selects, both submitted by the same surrounding form
// (see the "project"/"server" name props) - picking a new project resets
// the server choice, since a city id from one project means nothing on
// another. Needs local state (not two plain server-rendered <Select>s)
// purely so the server dropdown's options can react to the project one
// without a full page round-trip.
export function ProjectServerSelector({
  defaultProject,
  defaultServer,
  citiesByProject,
  labels,
}: {
  defaultProject: string | null;
  defaultServer: string | null;
  citiesByProject: Record<ProjectKey, ProjectCity[]>;
  labels: {
    projectLabel: string;
    serverLabel: string;
    projectNone: string;
    serverNone: string;
    majestic: string;
    russiaonline: string;
    gta5rp: string;
  };
}) {
  const [project, setProject] = useState<string>(defaultProject ?? "none");
  const [server, setServer] = useState<string>(defaultProject ? (defaultServer ?? "none") : "none");

  const cities = PROJECT_KEYS.includes(project as ProjectKey)
    ? citiesByProject[project as ProjectKey]
    : [];

  function handleProjectChange(next: string | null) {
    setProject(next ?? "none");
    setServer("none"); // a city id from the old project means nothing here
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="project">{labels.projectLabel}</Label>
        <Select
          value={project}
          onValueChange={handleProjectChange}
          items={{
            none: labels.projectNone,
            majestic: labels.majestic,
            russiaonline: labels.russiaonline,
            gta5rp: labels.gta5rp,
          }}
        >
          <SelectTrigger id="project" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{labels.projectNone}</SelectItem>
            <SelectItem value="majestic">{labels.majestic}</SelectItem>
            <SelectItem value="russiaonline">{labels.russiaonline}</SelectItem>
            <SelectItem value="gta5rp">{labels.gta5rp}</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="project" value={project === "none" ? "" : project} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="server">{labels.serverLabel}</Label>
        <Select
          key={project}
          value={server}
          onValueChange={(next) => setServer(next ?? "none")}
          disabled={cities.length === 0}
          items={{ none: labels.serverNone, ...Object.fromEntries(cities.map((c) => [c.id, c.name])) }}
        >
          <SelectTrigger id="server" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{labels.serverNone}</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="server" value={server === "none" ? "" : server} />
      </div>
    </>
  );
}
