const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const isLocal = slsw.lib.webpack.isLocal;
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  context: __dirname,
  mode: isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: isLocal ? 'source-map' : 'none',
  resolve: {
    extensions: ['.mjs', '.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  // plugins: [new BundleAnalyzerPlugin()],
};
