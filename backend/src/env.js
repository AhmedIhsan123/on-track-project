import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env lives in the backend directory (one level up from backend/src/)
config({ path: resolve(__dirname, '../.env') });
