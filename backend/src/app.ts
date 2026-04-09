import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';

const app = express();

app.use(helmet());

// Configure CORS with specific allowed origins
const rawOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];
const allowedOrigins = rawOrigins.map(o => o.trim()).filter(o => o !== '*');

if (rawOrigins.includes('*')) {
  console.warn('Wildcard "*" is not allowed in ALLOWED_ORIGINS and has been removed');
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));

app.use('/api', routes);

export default app;
