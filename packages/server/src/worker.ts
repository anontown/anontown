import { CronJob } from "cron";
import { Logger, Repo } from "./adapters";
import { ResWaitCountKey } from "./entities";

export function runWorker() {
  const logger = new Logger();
  const repo = new Repo();

  runTopicWorker(repo, logger);
  runUserWorker(repo, logger);
}

function runTopicWorker(repo: Repo, logger: Logger) {
  // 毎時間トピ落ちチェック
  new CronJob({
    cronTime: "00 00 * * * *",
    onTick: async () => {
      logger.info("TopicCron");
      await repo.topic.cronTopicCheck(new Date());
    },
    start: false,
    timeZone: "Asia/Tokyo",
  }).start();
}

function runUserWorker(repo: Repo, logger: Logger) {
  const start = (cronTime: string, key: ResWaitCountKey) => {
    new CronJob({
      cronTime,
      onTick: async () => {
        logger.info(`UserCron ${key}`);
        await repo.user.cronCountReset(key);
      },
      start: false,
      timeZone: "Asia/Tokyo",
    }).start();
  };

  start("00 00,10,20,30,40,50 * * * *", "m10");
  start("00 00,30 * * * *", "m30");
  start("00 00 * * * *", "h1");
  start("00 00 00,06,12,18 * * *", "h6");
  start("00 00 00,12 * * *", "h12");
  start("00 00 00 * * *", "d1");
  new CronJob({
    cronTime: "00 00 00 * * *",
    onTick: async () => {
      await repo.user.cronPointReset();
    },
    start: false,
    timeZone: "Asia/Tokyo",
  }).start();
}
