import pg from "pg";

const { Pool } = pg;

export type QueryResult<Row> = {
  rows: Row[];
};

export type QueryClient = {
  query<Row>(
    text: string,
    values?: readonly unknown[],
  ): Promise<QueryResult<Row>>;
};

let sharedPool: pg.Pool | undefined;

export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  return databaseUrl;
}

export function createPgPool(connectionString = getDatabaseUrl()): pg.Pool {
  return new Pool({
    connectionString,
  });
}

export function getPgPool(): pg.Pool {
  sharedPool ??= createPgPool();
  return sharedPool;
}
