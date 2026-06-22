import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

// Require migrate-mongo to avoid import/type compilation conflicts
const migrateMongo = require('migrate-mongo');

export async function runMigrations() {
  const logger = new Logger('MigrationRunner');
  try {
    logger.log('Initializing database migrations config...');

    const dbUri = process.env.MONGODB_URI || 'mongodb://root:examplepassword@localhost:27017/courtmate?authSource=admin';
    
    // Resolve migrations directory relative to the compiled/source file location
    const migrationsDir = path.join(__dirname, '../../../migrations');
    
    logger.log(`Resolved migrations directory: ${migrationsDir}`);

    if (!fs.existsSync(migrationsDir)) {
      logger.warn(`Migrations directory does not exist at ${migrationsDir}. Creating it...`);
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // Set config programmatically
    migrateMongo.config.set({
      mongodb: {
        url: dbUri,
        databaseName: 'courtmate',
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      },
      migrationsDir,
      changelogCollectionName: 'changelog',
      migrationFileExtension: '.js',
      useFileHash: false,
    });

    logger.log('Connecting to database...');
    const { db, client } = await migrateMongo.database.connect();
    
    logger.log('Running pending migrations...');
    const migrated = await migrateMongo.up(db, client);
    
    if (migrated && migrated.length > 0) {
      logger.log(`Successfully applied ${migrated.length} database migration(s):`);
      migrated.forEach((fileName: string) => logger.log(` - ${fileName}`));
    } else {
      logger.log('Database schema is up to date.');
    }

    await client.close();
  } catch (error) {
    logger.error('Failed to run database migrations:', error);
    throw error;
  }
}
