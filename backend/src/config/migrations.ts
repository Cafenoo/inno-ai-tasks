import { DataSource } from 'typeorm';

export async function runMigrations(dataSource: DataSource): Promise<void> {
  try {
    await dataSource.runMigrations();
  } catch (error) {
    throw new Error(`Failed to run migrations: ${error}`);
  }
} 