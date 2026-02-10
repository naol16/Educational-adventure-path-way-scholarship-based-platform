import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from project root (one level up from src/config/env.ts -> src/config -> src -> root?? No.
// src/config/env.ts 
// src/config
// src
// backend (root)
// So we need to go up from config (..) -> src (..) -> backend (..) -> .env?
// Wait, file path is backend/src/config/env.ts
// backend/src/config -> .. -> backend/src -> .. -> backend
// So path.resolve(__dirname, '../../.env')

const result = dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (result.error) {
    console.warn("Warning: .env file not found at " + path.resolve(__dirname, '../../.env'));
    // Fallback to default if .env is in CWD
    dotenv.config();
}

console.log("DEBUG: env.ts loaded. JWT_SECRET present:", !!process.env.JWT_SECRET);
