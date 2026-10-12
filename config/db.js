import mysql from "mysql2/promise";
import { promises as fs } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

const dataDir = join(__dirname, "..", "data");
const dbFile = join(dataDir, "database.json");

const initialDatabase = {
  pets: [],
  tasks: [],
  vaccinations: [],
  reminders: [],
  medicines: [],
  healthRecords: [],
  lostPets: [],
  users: [],
};

let pool = null;
let useMySql = false;

function createMySqlPool() {
  if (pool) return pool;

  const uri = process.env.MYSQL_URI || process.env.DATABASE_URL;
  const host = process.env.DB_HOST;

  try {
    if (uri) {
      const connectionUri = new URL(uri);
      connectionUri.searchParams.delete("ssl-mode");
      pool = mysql.createPool({
        uri: connectionUri.toString(),
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      return pool;
    }

    if (host) {
      pool = mysql.createPool({
        host,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "defaultdb",
        ssl:
          process.env.DB_SSL === "false"
            ? undefined
            : { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      return pool;
    }
  } catch (err) {
    console.error("Failed to create MySQL pool:", err.message);
  }

  return null;
}

async function ensureMySqlSchema(p) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL DEFAULT '',
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      createdAt VARCHAR(64) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS pets (
      id VARCHAR(64) PRIMARY KEY,
      userId VARCHAR(64),
      name VARCHAR(255),
      type VARCHAR(64),
      breed VARCHAR(128),
      age VARCHAR(64),
      gender VARCHAR(32),
      color VARCHAR(64),
      weight VARCHAR(32),
      notes TEXT,
      createdAt VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(64) PRIMARY KEY,
      userId VARCHAR(64),
      petId VARCHAR(64),
      petName VARCHAR(255),
      task VARCHAR(255),
      type VARCHAR(64),
      date VARCHAR(64),
      time VARCHAR(32),
      status VARCHAR(32),
      notes TEXT,
      createdAt VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS vaccinations (
      id VARCHAR(64) PRIMARY KEY,
      userId VARCHAR(64),
      petId VARCHAR(64),
      petName VARCHAR(255),
      vaccineName VARCHAR(255),
      dateGiven VARCHAR(64),
      dueDate VARCHAR(64),
      vetName VARCHAR(255),
      clinicName VARCHAR(255),
      status VARCHAR(32),
      notes TEXT,
      createdAt VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS reminders (
      id VARCHAR(64) PRIMARY KEY,
      userId VARCHAR(64),
      petId VARCHAR(64),
      petName VARCHAR(255),
      title VARCHAR(255),
      category VARCHAR(64),
      date VARCHAR(64),
      time VARCHAR(32),
      \`repeat\` VARCHAR(32),
      notes TEXT,
      completed TINYINT(1) DEFAULT 0,
      createdAt VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS medicines (
      id VARCHAR(64) PRIMARY KEY,
      userId VARCHAR(64),
      petId VARCHAR(64),
      petName VARCHAR(255),
      name VARCHAR(255),
      dosage VARCHAR(128),
      frequency VARCHAR(128),
      startDate VARCHAR(64),
      endDate VARCHAR(64),
      instructions TEXT,
      prescribedBy VARCHAR(255),
      createdAt VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS healthRecords (
      id VARCHAR(64) PRIMARY KEY,
      userId VARCHAR(64),
      petId VARCHAR(64),
      petName VARCHAR(255),
      date VARCHAR(64),
      weight VARCHAR(32),
      temperature VARCHAR(32),
      symptoms TEXT,
      diagnosis TEXT,
      vetNotes TEXT,
      createdAt VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS lostPets (
      id VARCHAR(64) PRIMARY KEY,
      userId VARCHAR(64),
      petName VARCHAR(255),
      type VARCHAR(64),
      breed VARCHAR(128),
      lastSeenDate VARCHAR(64),
      lastSeenLocation TEXT,
      contactName VARCHAR(255),
      contactPhone VARCHAR(64),
      description TEXT,
      status VARCHAR(32),
      createdAt VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ];

  for (const sql of tables) {
    await p.query(sql);
  }
}

export async function initDb() {
  // Ensure local data dir exists for fallback
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {}

  const p = createMySqlPool();
  if (p) {
    try {
      await ensureMySqlSchema(p);
      console.log("🐬 Connected to Aiven MySQL: schema ready.");
      useMySql = true;
      return;
    } catch (err) {
      console.warn("⚠️  MySQL connection failed, falling back to local database.json:", err.message);
      useMySql = false;
    }
  }

  // Fallback: local JSON file
  try {
    await fs.access(dbFile);
  } catch {
    await fs.writeFile(dbFile, JSON.stringify(initialDatabase, null, 2), "utf-8");
  }
  console.log("📂 Using local database.json");
}

// ─── MySQL helpers ────────────────────────────────────────────────────────────

export function isUsingMySql() {
  return useMySql && pool !== null;
}

export function getPool() {
  return pool;
}

/**
 * Read all rows from a MySQL table and return them as plain objects.
 */
export async function mysqlReadAll(table) {
  const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
  return rows.map((r) => {
    const obj = { ...r };
    // Convert tinyint booleans
    if ("completed" in obj) obj.completed = Boolean(obj.completed);
    return obj;
  });
}

/**
 * Insert a single row object into a MySQL table.
 * All values are stored as-is (strings, numbers).
 */
export async function mysqlInsert(table, obj) {
  const keys = Object.keys(obj);
  const values = Object.values(obj);
  const placeholders = keys.map(() => "?").join(", ");
  const cols = keys.map((k) => `\`${k}\``).join(", ");
  await pool.query(`INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders})`, values);
}

/**
 * Delete a row by its `id` column.
 */
export async function mysqlDeleteById(table, id) {
  const [result] = await pool.query(`DELETE FROM \`${table}\` WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

/**
 * Update specific columns of a row identified by `id`.
 */
export async function mysqlUpdateById(table, id, fields) {
  const sets = Object.keys(fields).map((k) => `\`${k}\` = ?`).join(", ");
  const values = [...Object.values(fields), id];
  await pool.query(`UPDATE \`${table}\` SET ${sets} WHERE id = ?`, values);
}

// ─── JSON file helpers (fallback) ─────────────────────────────────────────────

export async function readDb() {
  try {
    const data = await fs.readFile(dbFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading local database:", error);
    return { ...initialDatabase };
  }
}

export async function writeDb(data) {
  try {
    await fs.writeFile(dbFile, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing to local database file:", error);
    return false;
  }
}
