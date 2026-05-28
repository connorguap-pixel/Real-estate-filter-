import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze.js';
import propertiesRouter from './routes/properties.js';
import batchRouter from './routes/batch.js';
import notificationsRouter from './routes/notifications.js';
import buyersRouter from './routes/buyers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/analyze', analyzeRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/batch', batchRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/buyers', buyersRouter);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Track DealOS backend running on port ${PORT}`);
});
