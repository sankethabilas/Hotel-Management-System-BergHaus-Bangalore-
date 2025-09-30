import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import loyaltyRoutes from './routes/loyaltyRoutes.js';
import offerRoutes from './routes/offerRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});


app.use('/api/feedback', feedbackRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/offers', offerRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();


