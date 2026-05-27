const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@react-native-google-signin/google-signin') {
    // If the requester is our mock file, let Metro resolve the actual library
    if (context.originModulePath && context.originModulePath.includes('google-signin-mock.js')) {
      return context.resolveRequest(context, moduleName, platform);
    }
    // Otherwise, redirect to our mock
    return {
      filePath: path.resolve(__dirname, 'google-signin-mock.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

