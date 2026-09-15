// Runs once when the server process boots (Next.js instrumentation hook).
// Records an online-player snapshot for all three projects on a real fixed
// interval, independent of page views - the previous approach recorded a
// snapshot as a side effect of someone loading the monitoring page, which
// produced irregular gaps (2, 5, 12+ minutes) whenever nobody had the page
// open, rather than a clean per-minute series.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getMajesticOnline, getRussiaOnlineOnline, getGta5rpOnline, recordOnlineSnapshot } =
    await import("@/lib/online-monitoring");

  const SNAPSHOT_INTERVAL_MS = 60 * 1000;

  async function recordAll() {
    try {
      const [majestic, russiaOnline, gta5rp] = await Promise.all([
        getMajesticOnline(),
        getRussiaOnlineOnline(),
        getGta5rpOnline(),
      ]);
      await Promise.all([
        majestic && recordOnlineSnapshot("majestic", majestic.totalPlayers, majestic.cities),
        russiaOnline &&
          recordOnlineSnapshot("russiaonline", russiaOnline.totalPlayers, russiaOnline.cities),
        gta5rp && recordOnlineSnapshot("gta5rp", gta5rp.totalPlayers, gta5rp.cities),
      ]);
    } catch (error) {
      console.error("instrumentation: online snapshot tick failed", error);
    }
  }

  recordAll();
  setInterval(recordAll, SNAPSHOT_INTERVAL_MS);
}
