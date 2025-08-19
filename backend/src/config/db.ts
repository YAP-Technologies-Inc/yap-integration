import { Pool } from "pg"; 
import { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT } from "./env.js";

export const db = new Pool({
  user: PGUSER,
  host: PGHOST,
  database: PGDATABASE,
  password: PGPASSWORD,
  port: PGPORT ? Number(PGPORT) : 5432,
});
