import { pool } from "./database/database.js";

async function fixConstraint() {
  const client = await pool.connect();
  try {
    console.log("Checking/adding chat_messages_parent_id_fkey constraint...");
    const sql = `DO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_parent_id_fkey') THEN\n    ALTER TABLE chat_messages\n      ADD CONSTRAINT chat_messages_parent_id_fkey FOREIGN KEY (reply_to_id) REFERENCES chat_messages(id) ON DELETE SET NULL;\n  END IF;\nEND$$;`;

    await client.query(sql);
    console.log("✅ Constraint ensured.");
  } catch (err) {
    console.error("Failed to ensure constraint:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

fixConstraint().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
