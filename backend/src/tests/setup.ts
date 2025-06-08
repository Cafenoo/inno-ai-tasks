import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { User } from '../entities/user.entity';
import { Address } from '../entities/address.entity';
import { Company } from '../entities/company.entity';
import { Auth } from '../entities/auth.entity';
import express from 'express';
import cors from 'cors';
import { runMigrations } from '../config/migrations';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { CreateInitialSchema1709123456789 } from '../migrations/1709123456789-CreateInitialSchema';
import { CreateAuthTable1709123456790 } from '../migrations/1709123456790-CreateAuthTable';
import userRoutes from '../routes/user.routes';
import authRoutes from '../routes/auth.routes';
import { authenticateToken } from '../middleware/auth.middleware';
import { errorHandler } from '../middleware/error.middleware';

// Load test environment variables
config({ path: join(__dirname, '../../.env.test') });

// Global variables for test setup
let container: StartedPostgreSqlContainer;
let dataSource: DataSource;
let server: any;

// Dynamic port for the Express server
export const port = 3001 + Math.floor(Math.random() * 1000);

// Create test app instance
const app = express();
app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', authenticateToken, userRoutes);

// Error handling
app.use(errorHandler);

// Initialize test environment
beforeAll(async () => {
  try {
    // Start PostgreSQL container
    container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('database')
      .withUsername('postgres')
      .withPassword('postgres')
      .withExposedPorts(5432)
      .start();

    console.log('Container started with connection details:', {
      host: container.getHost(),
      port: container.getMappedPort(5432),
      database: container.getDatabase()
    });

    // Initialize data source with test container connection details
    dataSource = new DataSource({
      type: 'postgres',
      host: container.getHost(),
      port: container.getMappedPort(5432),
      username: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
      entities: [User, Address, Company, Auth],
      migrations: [CreateInitialSchema1709123456789, CreateAuthTable1709123456790],
      synchronize: false,
      logging: false
    });

    // Initialize database connection
    await dataSource.initialize();
    console.log('Database connection initialized successfully');

    // Set the test data source in the services
    AuthService.setDataSource(dataSource);
    UserService.setDataSource(dataSource);

    // Run migrations
    await runMigrations(dataSource);
    console.log('Database migrations completed successfully');

    // Start Express server
    server = app.listen(port, '0.0.0.0', () => {
      console.log(`Test server listening on port ${port}`);
    });

    console.log('Test environment initialized successfully');
  } catch (error) {
    console.error('Error during test environment initialization:', error);
    throw error;
  }
}, 120000);

// Clean database before each test
beforeEach(async () => {
  try {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    
    // Drop all tables and sequences
    await queryRunner.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
        FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
          EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    
    // Run migrations again to recreate tables
    await runMigrations(dataSource);
    
    await queryRunner.release();
  } catch (error) {
    console.error('Error during database cleanup:', error);
    throw error;
  }
}, 30000);

// Cleanup after all tests
afterAll(async () => {
  try {
    // Close server
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err: any) => {
          if (err) reject(new Error(err.message ?? 'Failed to close server'));
          else resolve();
        });
      });
    }

    // Close database connection
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }

    // Stop container
    if (container) {
      try {
        await container.stop();
      } catch (error) {
        console.error('Error stopping container:', error);
      }
    }
  } catch (error) {
    console.error('Error during test cleanup:', error);
    throw error;
  }
}, 30000);

// Export the app for use in tests
export { app }; 