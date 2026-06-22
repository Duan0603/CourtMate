const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const config = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://root:examplepassword@localhost:27017/courtmate?authSource=admin',
    databaseName: 'courtmate',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config;
