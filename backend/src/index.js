import './env.js';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { supabase } from './db/supabase.js';
import authRouter from './routes/auth.js';
import applicationsRouter from './routes/applications.js';

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

app.use('/auth', authRouter);
app.use('/applications', applicationsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
