import {
  Pool,
  type QueryConfig,
  type QueryResult,
  type QueryResultRow,
} from "pg";

declare global {
  var __pgPool__: Pool | undefined;
}

const getPool = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. See README.md for local credential setup."
    );
  }

  if (!global.__pgPool__) {
    global.__pgPool__ = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }

  return global.__pgPool__;
};

const pool = getPool();

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  query: string | QueryConfig,
  params?: unknown[]
): Promise<QueryResult<T>> {
  if (typeof query === "string") {
    return pool.query<T>(query, params);
  }
  return pool.query<T>(query);
}
