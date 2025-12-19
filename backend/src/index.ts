import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { router as apiRouter } from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;