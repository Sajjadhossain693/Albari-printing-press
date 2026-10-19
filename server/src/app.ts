import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import routes from './routes/index.js';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload and assets folders exist
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

// Serve client public assets (photos, logo, banners)
const clientAssetsDir = path.resolve('../client/public/assets');
if (fs.existsSync(clientAssetsDir)) {
  app.use('/assets', express.static(clientAssetsDir));
}

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    app: 'Al-Bari Press & Digital Sign Management System',
    timestamp: new Date().toISOString()
  });
});

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;
