import './env.js';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { supabase } from './db/supabase.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  const { error } = await supabase.from('users').select('id').limit(1);
  res.json({
    status: 'ok',
    db: error ? `error: ${error.message}` : 'connected',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
