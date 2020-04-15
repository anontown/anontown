import { esUtils } from "../migration-utils";

export async function up() {
  await esUtils.reindex("reses", "reses_1", "reses_1586956049557");
  await esUtils.reindex("histories", "histories_1", "histories_1586956049557");
  await esUtils.reindex("msgs", "msgs_1", "msgs_1586956049557");
  await esUtils.reindex("topics", "topics_1", "topics_1586956049557");
}
