import { eq } from "drizzle-orm";
import { Activity } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { guildBotSettings } from "@/lib/db/schema";
import {
  getMajesticOnline,
  getRussiaOnlineOnline,
  getGta5rpOnline,
  getOnlineHistory,
  getCityOnlineHistory,
} from "@/lib/online-monitoring";
import { OnlineMonitoringTabs } from "@/components/dashboard/online-monitoring-tabs";

export default async function MonitoringPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/monitoring">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.monitoring");
  // Snapshot history is now recorded by a real per-minute scheduler (see
  // src/instrumentation.ts), not as a side effect of loading this page -
  // this just reads the current live numbers and the accumulated history.
  const [majestic, russiaOnline, gta5rp, [botSettings]] = await Promise.all([
    getMajesticOnline(),
    getRussiaOnlineOnline(),
    getGta5rpOnline(),
    db.select().from(guildBotSettings).where(eq(guildBotSettings.guildId, guildId)).limit(1),
  ]);
  // The owner can link this family to a single RP platform on the Settings
  // page - once set, this page narrows to just that project instead of
  // showing all three tabs.
  const linkedProject = botSettings?.project ?? null;

  // Fetched once at the widest range the UI offers (30 days) - the range
  // buttons in OnlineMonitoringTabs just filter this client-side instead of
  // re-fetching per click. Per-city history is one row per city per tick, so
  // it's a lot more data than the total-only series - keeping the window to
  // just what the UI can select keeps that bounded.
  const HISTORY_HOURS = 30 * 24;
  // A fixed minimum so the loading.tsx transition reads the same every
  // time instead of flickering by in whatever fraction of a second the
  // upstream APIs happened to respond in.
  const MIN_LOAD_MS = 1000;
  const [
    majesticHistory,
    russiaOnlineHistory,
    gta5rpHistory,
    majesticCityHistory,
    russiaOnlineCityHistory,
    gta5rpCityHistory,
  ] = await Promise.all([
    getOnlineHistory("majestic", HISTORY_HOURS),
    getOnlineHistory("russiaonline", HISTORY_HOURS),
    getOnlineHistory("gta5rp", HISTORY_HOURS),
    getCityOnlineHistory("majestic", HISTORY_HOURS),
    getCityOnlineHistory("russiaonline", HISTORY_HOURS),
    getCityOnlineHistory("gta5rp", HISTORY_HOURS),
    new Promise((resolve) => setTimeout(resolve, MIN_LOAD_MS)),
  ]);

  const allProjects = [
    {
      key: "majestic",
      label: "Majestic RP",
      logo: "https://majestic-rp.ru/favicon.ico",
      data: majestic,
      history: majesticHistory,
      cityHistory: majesticCityHistory,
    },
    {
      key: "russiaonline",
      label: t("russiaOnlineName"),
      logo: "https://majestic-rp.ru/images/russia-online/ro-logo-icon.svg",
      data: russiaOnline,
      history: russiaOnlineHistory,
      cityHistory: russiaOnlineCityHistory,
    },
    {
      key: "gta5rp",
      label: "GTA5RP",
      logo: "https://gta5rp.com/favicon/android-icon-192x192.png",
      data: gta5rp,
      history: gta5rpHistory,
      cityHistory: gta5rpCityHistory,
    },
  ];
  const projects = linkedProject
    ? allProjects.filter((p) => p.key === linkedProject)
    : allProjects;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Activity className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>
      <OnlineMonitoringTabs
        projects={projects}
        current={t("current")}
        peakToday={t("peakToday")}
        peakAllTime={t("peakAllTime")}
        peakInRange={t("peakInRange")}
        unavailable={t("unavailable")}
        historyEmpty={t("historyEmpty")}
        chartLabel={t("chartLabel")}
        colDate={t("colDate")}
        colPlayers={t("colPlayers")}
        rangeLabels={{
          1: t("range1"),
          7: t("range7"),
          30: t("range30"),
        }}
      />
    </div>
  );
}
