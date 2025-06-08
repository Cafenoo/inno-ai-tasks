import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Address } from '../entities/address.entity';
import { Company } from '../entities/company.entity';
import { Auth } from '../entities/auth.entity';
import { CreateInitialSchema1709123456789 } from '../migrations/1709123456789-CreateInitialSchema';
import { CreateAuthTable1709123456790 } from '../migrations/1709123456790-CreateAuthTable';
import { SeedUsersData1709123456791 } from '../migrations/1709123456791-SeedUsersData';

// Create data source without immediate validation
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'database',
  entities: [User, Address, Company, Auth],
  synchronize: false, // We'll handle migrations manually
  logging: process.env.NODE_ENV !== 'production',
  // Add connection timeout and retry options
  connectTimeoutMS: 10000,
  extra: {
    // Add connection pool settings
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
  migrations: [
    CreateInitialSchema1709123456789,
    CreateAuthTable1709123456790,
    SeedUsersData1709123456791
  ],
  subscribers: [],
}); 