import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import userRoutes from './routes/user.routes';
import { CustomError } from './types/error';
import { AppDataSource } from './config/data-source';
import app from './app';
import { runMigrations } from './config/migrations';
import { log } from './utils/logger';

const port = process.env.PORT ?? 3000;

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      message: err.message,
      errors: err.validationErrors
    });
    return;
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
};

app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    log('Database connection established');

    // Run migrations
    await runMigrations(AppDataSource);
    log('Migrations completed successfully');

    // Start the server
    app.listen(port, () => {
      log(`Server is running on port ${port}`);
    });
  } catch (error) {
    log('Error during database initialization:', error);
    process.exit(1);
  }
};

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export { app }; 