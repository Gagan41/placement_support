import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

import authRouter from './routes/auth';
import examsRouter from './routes/exams';
import tintRouter from './routes/tint';
import logsRouter from './routes/logs';
import collegesRouter from './routes/colleges';
import adminRouter from './routes/admin';
import analyticsRouter from './routes/analytics';

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/exams', examsRouter);
app.use('/tint', tintRouter);
app.use('/logs', logsRouter);
app.use('/colleges', collegesRouter);
app.use('/admin', adminRouter);
app.use('/analytics', analyticsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
