import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import router from './routes';

const app: Application = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  xFrameOptions: false,
}));
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(morgan('dev'));

// Static files
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/", (req, res) => {
  return res.send("Hello world")
})

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'API is running', data: { timestamp: new Date() } });
});

// API Routes
app.use('/api', router);

// Error Handling (Must be last)
app.use(errorHandler as any);

export default app;
