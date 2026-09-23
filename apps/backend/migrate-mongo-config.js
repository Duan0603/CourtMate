const path = require('path');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}
require('dotenv').config({ path: path.join(__dirname, '.env') });

const config = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://root:examplepassword@localhost:27017/courtmate?authSource=admin',
    databaseName: 'courtmate',
    options: {}
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config;
