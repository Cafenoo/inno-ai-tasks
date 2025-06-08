import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import { authenticateToken } from './middleware/auth.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', authenticateToken, userRoutes);

// Error handling
app.use(errorHandler as ErrorRequestHandler);

export default app; 