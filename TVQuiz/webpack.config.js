const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * Web build: the same app code, with react-native swapped for react-native-web.
 * Files ending in .web.ts(x) replace their native version, like .android.ts does for Metro.
 */
module.exports = (_env, argv) => {
  const isDev = argv.mode !== 'production';

  return {
    entry: path.resolve(__dirname, 'index.web.js'),
    output: {
      path: path.resolve(__dirname, 'dist/web'),
      filename: 'bundle.[contenthash].js',
      clean: true,
    },
    devtool: isDev ? 'eval-source-map' : false,
    resolve: {
      alias: { 'react-native$': 'react-native-web' },
      extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: { loader: 'babel-loader' },
        },
        // Sound files are copied to the output; importing one gives its URL.
        { test: /\.wav$/, type: 'asset/resource' },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'web/index.html') }),
      new webpack.DefinePlugin({ __DEV__: JSON.stringify(isDev) }),
    ],
    devServer: { port: 8080, historyApiFallback: true, hot: false },
  };
};
