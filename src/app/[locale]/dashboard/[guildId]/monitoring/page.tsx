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

  const [majesticHistory, russiaOnlineHistory, gta5rpHistory] = await Promise.all([
    getOnlineHistory("majestic"),
    getOnlineHistory("russiaonline"),
    getOnlineHistory("gta5rp"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      <OnlineMonitoringTabs
        projects={[
          { key: "majestic", label: "Majestic RP", data: majestic, history: majesticHistory },
          {
            key: "russiaonline",
            label: t("russiaOnlineName"),
            data: russiaOnline,
            history: russiaOnlineHistory,
          },
          { key: "gta5rp", label: "GTA5RP", data: gta5rp, history: gta5rpHistory },
        ]}
        current={t("current")}
        peakToday={t("peakToday")}
        peakAllTime={t("peakAllTime")}
        unavailable={t("unavailable")}
        historyEmpty={t("historyEmpty")}
      />
    </div>
  );
}
