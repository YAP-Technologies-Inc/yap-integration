import { Pool } from "pg";

const conn =
  process.env.DB_URL ??
  (() => {
    // optional fallback if you still keep PG* around
    const host = process.env.PGHOST;
    const user = process.env.PGUSER ;
    const pass = process.env.PGPASSWORD ;
    const db   = process.env.PGDATABASE;
    const port = process.env.PGPORT;
    return `postgres://${user}:${pass}@${host}:${port}/${db}`;
  })();

if (!conn) {
  throw new Error("DB_URL not set and no PG* fallback available");
}

export const db = new Pool({ connectionString: conn });
  