import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize } from "../config/sequelize.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database for migrations.");

    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );`,
    );

    const migrationsDir = path.join(__dirname, "../../database/migrations");
    const files = (await fs.readdir(migrationsDir))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    const [appliedRows]: any = await sequelize.query(
      `SELECT name FROM schema_migrations`,
    );
    const appliedMigrations = new Set(appliedRows.map((row: any) => row.name));

    for (const fileName of files) {
      if (appliedMigrations.has(fileName)) {
        console.log(`- Skipping already applied migration: ${fileName}`);
        continue;
      }

      const filePath = path.join(migrationsDir, fileName);
      const sql = await fs.readFile(filePath, "utf-8");

      console.log(`> Applying migration: ${fileName}`);
      try {
        await sequelize.query(sql);
      } catch (migrationError: any) {
        const message = String(migrationError.message || migrationError);
        if (
          message.includes("cannot have more than 2000 dimensions") &&
          /CREATE INDEX.*vector_cosine_ops/i.test(sql)
        ) {
          console.warn(
            `⚠️ Migration ${fileName} skipped vector index creation because the current pgvector build does not support >2000 dimensions. The schema changes before the index are still applied if possible.`,
          );
        } else {
          throw migrationError;
        }
      }

      await sequelize.query(
        `INSERT INTO schema_migrations (name) VALUES ($1)`,
        {
          bind: [fileName],
        },
      );
      console.log(`✅ Migration applied: ${fileName}`);
    }

    console.log("All migrations applied.");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations();
