const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  // Make sure process/browser is correctly resolved
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve.fallback,
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "util": require.resolve("util/"),
      "zlib": require.resolve("browserify-zlib"),
      "stream": require.resolve("stream-browserify"),
      "process": require.resolve("process/browser"),
    },
    alias: {
      ...config.resolve.alias,
      // Add this explicit alias
      "process/browser": require.resolve("process/browser")
    }
  };

  // Simplify plugin configuration to avoid conflicts
  config.plugins = [
    ...config.plugins.filter(plugin => 
      plugin.constructor.name !== 'DefinePlugin' && 
      plugin.constructor.name !== 'ProvidePlugin'
    ),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ];

  return config;
};