import cron from "node-cron";
import { runScheduledPublishing } from "../../lib/scheduler";
import { syncAllAnalytics } from "../../lib/analytics";

async function tick() {
  const publishResult = await runScheduledPublishing();
  if (publishResult.processed > 0 || publishResult.errors.length > 0) {
    console.log("publishResult", publishResult);
  }
}

async function sync() {
  const syncResult = await syncAllAnalytics();
  if (syncResult.created > 0 || syncResult.errors.length > 0) {
    console.log("syncResult", syncResult);
  }
}

cron.schedule("*/2 * * * *", tick);
cron.schedule("0 * * * *", sync);

console.log("Erystra jobs worker started.");
void tick();
void sync();
