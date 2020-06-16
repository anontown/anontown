import * as fs from "fs-promise";
import * as path from "path";
import { Mongo } from "./db";
import { mongoUtils } from "./migration-utils";

export async function runNotExecutedMigrations(): Promise<
  Array<MigrationModule>
> {
  const executedMigrationNames = new Set(
    (await listMigrations()).map(x => x.name),
  );
  return (await getMigrationModules()).filter(
    x => !executedMigrationNames.has(x.name),
  );
}

// 全てのマイグレーションを実行して保存しない
// テスト用
export async function forceRunAllMigrationsAndNotSave(): Promise<void> {
  const migrations = await getMigrationModules(".ts");
  for (const migration of migrations) {
    await migration.up();
  }
}

export async function checkMigration(): Promise<void> {
  if ((await runNotExecutedMigrations()).length !== 0) {
    throw new Error("Migration required.");
  }
}

export async function runMigrations(): Promise<void> {
  const migrations = await runNotExecutedMigrations();
  for (const migration of migrations) {
    console.log(`run migration: ${migration.name}`);
    await migration.up();
    console.log(`completed migration: ${migration.name}`);
    await saveMigration({ name: migration.name, migratedAt: new Date() });
  }
}

export async function createMigrationsDatabase(): Promise<void> {
  const db = await Mongo();
  const migrations = await mongoUtils.createCollection(db, "migrations");
  await migrations.createIndex({ name: 1 }, { name: "name_1", unique: true });
}

export async function saveMigration(migration: Migration): Promise<void> {
  await createMigrationsDatabase();

  const db = await Mongo();
  await db.collection("migrations").insertOne(migration);
}

export async function listMigrations(): Promise<Array<Migration>> {
  await createMigrationsDatabase();

  const db = await Mongo();
  const result = await db
    .collection("migrations")
    .find()
    .sort({ name: 1 })
    .toArray();
  const migrations = result.map<Migration>(({ migratedAt, name }) => ({
    migratedAt,
    name,
  }));
  return migrations;
}

export interface MigrationModule {
  name: string;
  up: () => Promise<void>;
}

export async function getMigrationModules(
  ext = ".js",
): Promise<Array<MigrationModule>> {
  const dir = path.join(__dirname, "migrations");
  const files = (await fs.readdir(dir))
    .filter(file => file.endsWith(ext))
    .sort();
  return files.map<MigrationModule>(file => ({
    name: path.basename(file, ext),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    up: require(path.join(dir, file)).up,
  }));
}

export interface Migration {
  name: string;
  migratedAt: Date;
}
