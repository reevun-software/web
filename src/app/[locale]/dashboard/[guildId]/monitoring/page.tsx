import { getTranslations } from "next-intl/server";
import {
  getMajesticOnline,
  getRussiaOnlineOnline,
  getGta5rpOnline,
} from "@/lib/online-monitoring";
import { OnlineMonitoringTabs } from "@/components/dashboard/online-monitoring-tabs";

export default async function MonitoringPage() {
  const t = await getTranslations("Dashboard.monitoring");
  const [majestic, russiaOnline, gta5rp] = await Promise.all([
    getMajesticOnline(),
    getRussiaOnlineOnline(),
    getGta5rpOnline(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      <OnlineMonitoringTabs
        projects={[
          { key: "majestic", label: "Majestic RP", data: majestic },
          { key: "russiaonline", label: t("russiaOnlineName"), data: russiaOnline },
          { key: "gta5rp", label: "GTA5RP", data: gta5rp },
        ]}
        current={t("current")}
        peakToday={t("peakToday")}
        peakAllTime={t("peakAllTime")}
        unavailable={t("unavailable")}
      />
    </div>
  );
}
