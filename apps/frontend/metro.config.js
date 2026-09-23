const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot, { isCSSEnabled: true });

// Limit workers on Windows to prevent NativeWind child_process deadlocks
config.maxWorkers = 2;

// 1. Watch shared packages and root node_modules only (avoid scanning backend node_modules)
config.watchFolders = [
  path.resolve(workspaceRoot, 'packages', 'shared'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Ensure web platform is recognized
config.resolver.platforms = ['web', 'ios', 'android'];

// Shim Node built-ins and alias react-native for web
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native': path.resolve(projectRoot, 'node_modules/react-native-web'),
  crypto: path.resolve(projectRoot, 'src/shims/crypto.js'),
};

module.exports = withNativeWind(config, { input: "./global.css" });
