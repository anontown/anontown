import { CronJob } from "cron";
import { Logger, TopicRepo, UserRepo } from "./adapters";
import { ResWaitCountKey } from "./entities";
import { prisma } from "./prisma-client";

export function runWorker(): void {
  runTopicWorker();
  runUserWorker();
}

function runTopicWorker() {
  // 毎時間トピ落ちチェック
  new CronJob({
    cronTime: "00 00 * * * *",
    onTick: async () => {
      await prisma.$transaction(async prismaTransaction => {
        const logger = new Logger();
        const topicRepo = new TopicRepo(prismaTransaction);

        logger.info("TopicCron");
        await topicRepo.cronTopicCheck(new Date());
      });
    },
    start: false,
    timeZone: "Asia/Tokyo",
  }).start();
}

function runUserWorker() {
  const start = (cronTime: string, key: ResWaitCountKey) => {
    new CronJob({
      cronTime,
      onTick: async () => {
        await prisma.$transaction(async prismaTransaction => {
          const logger = new Logger();
          const userRepo = new UserRepo(prismaTransaction);

          logger.info(`UserCron ${key}`);
          await userRepo.cronCountReset(key);
        });
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
      await prisma.$transaction(async prismaTransaction => {
        const userRepo = new UserRepo(prismaTransaction);
        await userRepo.cronPointReset();
      });
    },
    start: false,
    timeZone: "Asia/Tokyo",
  }).start();
}
