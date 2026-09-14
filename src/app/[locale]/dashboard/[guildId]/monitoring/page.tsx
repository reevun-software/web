import { getTranslations } from "next-intl/server";
import {
  getMajesticOnline,
  getRussiaOnlineOnline,
  getGta5rpOnline,
  getOnlineHistory,
  recordOnlineSnapshot,
  type OnlineProjectKey,
} from "@/lib/online-monitoring";
import { OnlineMonitoringTabs } from "@/components/dashboard/online-monitoring-tabs";

export default async function MonitoringPage() {
  const t = await getTranslations("Dashboard.monitoring");
  const [majestic, russiaOnline, gta5rp] = await Promise.all([
    getMajesticOnline(),
    getRussiaOnlineOnline(),
    getGta5rpOnline(),
  ]);

  const live: Record<OnlineProjectKey, { totalPlayers: number } | null> = {
    majestic,
    russiaonline: russiaOnline,
    gta5rp,
  };
  await Promise.all(
    (Object.entries(live) as [OnlineProjectKey, { totalPlayers: number } | null][])
      .filter(([, data]) => data)
      .map(([project, data]) => recordOnlineSnapshot(project, data!.totalPlayers)),
  );

  // Fetched once at the widest range the UI offers (90 days) - the range
  // buttons in OnlineMonitoringTabs just filter this client-side instead of
  // re-fetching per click.
  const HISTORY_HOURS = 90 * 24;
  const [majesticHistory, russiaOnlineHistory, gta5rpHistory] = await Promise.all([
    getOnlineHistory("majestic", HISTORY_HOURS),
    getOnlineHistory("russiaonline", HISTORY_HOURS),
    getOnlineHistory("gta5rp", HISTORY_HOURS),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      <OnlineMonitoringTabs
        projects={[
          {
            key: "majestic",
            label: "Majestic RP",
            logo: "https://majestic-rp.ru/favicon.ico",
            data: majestic,
            history: majesticHistory,
          },
          {
            key: "russiaonline",
            label: t("russiaOnlineName"),
            logo: "https://majestic-rp.ru/images/russia-online/ro-logo-icon.svg",
            data: russiaOnline,
            history: russiaOnlineHistory,
          },
          {
            key: "gta5rp",
            label: "GTA5RP",
            logo: "https://gta5rp.com/favicon/android-icon-192x192.png",
            data: gta5rp,
            history: gta5rpHistory,
          },
        ]}
        current={t("current")}
        peakToday={t("peakToday")}
        peakAllTime={t("peakAllTime")}
        peakInRange={t("peakInRange")}
        unavailable={t("unavailable")}
        historyEmpty={t("historyEmpty")}
        rangeLabels={{
          1: t("range1"),
          7: t("range7"),
          30: t("range30"),
          90: t("range90"),
        }}
      />
    </div>
  );
}
