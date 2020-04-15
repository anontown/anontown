import { Option } from "fp-ts/lib/Option";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as A from "fp-ts/lib/Array";
import { ESVersion, ESClient } from "../db";
import * as ord from "fp-ts/lib/Ord";
import { esUtils } from "../migration-utils";
import { IndicesCreateParams } from "elasticsearch";

export interface EsInfo {
  major: number;
  minor: number;
}

export interface AppInfo {
  name: string;
  ver: number;
}
export interface Info {
  es: EsInfo;
  app: AppInfo;
}

export function appInfoToString(info: AppInfo): string {
  return `${info.name}-${info.ver}`;
}

export function infoToString(info: Info): string {
  return `autoreindex-${info.es.major}-${info.es.minor}-${appInfoToString(
    info.app,
  )}`;
}

export function parseInfo(indexName: string): Option<Info> {
  return pipe(
    indexName.match(/^autoreindex-(\d+)-(\d+)-([a-z\d_]+)-(\d+)$/),
    O.fromNullable,
    O.map(([_, esMajor, esMinor, appName, appVer]) => ({
      app: { name: appName, ver: Number(appVer) },
      es: { major: Number(esMajor), minor: Number(esMinor) },
    })),
  );
}

export function parseInfos(indexNames: Array<string>): Array<Info> {
  return pipe(indexNames, A.filterMap(parseInfo));
}

export const CurEsInfo: EsInfo = {
  major: Number(ESVersion.split(".")[0]),
  minor: Number(ESVersion.split(".")[1]),
};

export async function createIndex(
  appInfo: AppInfo,
  paramBody: IndicesCreateParams["body"],
): Promise<void> {
  const indexName = infoToString({ app: appInfo, es: CurEsInfo });
  await esUtils.createIndex(ESClient(), {
    index: indexName,
    body: paramBody,
  });

  await ESClient().indices.updateAliases({
    body: {
      actions: [{ add: { index: indexName, alias: appInfoToString(appInfo) } }],
    },
  });
}

export async function autoReindex() {
  const indices = await ESClient().indices.get({ index: "*" });
  const indexList = pipe(
    Object.keys(indices),
    A.filterMap(indexName =>
      pipe(
        parseInfo(indexName),
        O.map(info => ({
          info,
          indexName,
          mappings: indices[indexName].mappings,
        })),
      ),
    ),
  );

  // app.ver、esverの順の優先度でappNameごとにもっとも最新の物
  const nameToMaxIndexListMap = new Map<
    string,
    {
      info: Info;
      indexName: string;
      mappings: any;
    }
  >();

  for (const index of indexList) {
    const val = nameToMaxIndexListMap.get(index.info.app.name);
    if (val === undefined) {
      nameToMaxIndexListMap.set(index.info.app.name, index);
    } else {
      if (
        ord.gt(ord.getTupleOrd(ord.ordNumber, ord.ordNumber, ord.ordNumber))(
          [index.info.app.ver, index.info.es.major, index.info.es.minor],
          [val.info.app.ver, val.info.es.major, val.info.es.minor],
        )
      ) {
        nameToMaxIndexListMap.set(index.info.app.name, index);
      }
    }
  }

  for (const index of nameToMaxIndexListMap.values()) {
    if (index.info.es.major < CurEsInfo.major) {
      const newIndexName = infoToString({ ...index.info, es: CurEsInfo });
      console.log(`auto reindex: ${index.indexName} -> ${newIndexName}`);
      await esUtils.createIndex(ESClient(), {
        index: newIndexName,
        body: {
          mappings: index.mappings,
        },
      });

      await ESClient().reindex({
        body: {
          source: {
            index: index.indexName,
          },
          dest: {
            index: newIndexName,
          },
        },
      });

      const aliasName = appInfoToString(index.info.app);
      console.log(`auto reindex create alias: ${aliasName}`);

      await ESClient().indices.updateAliases({
        body: {
          actions: [
            { remove: { index: index.indexName, alias: aliasName } },
            { add: { index: newIndexName, alias: aliasName } },
          ],
        },
      });
    }
  }
}
