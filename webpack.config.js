const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const APP_DIR = path.resolve(__dirname, 'src');
const DIST_DIR = path.resolve(__dirname, 'dist');
const STATIC_DIR = path.resolve(__dirname, 'static');

module.exports = {

  entry: {
    app: `${APP_DIR}/main/main.ts`,
    'main-window': `${APP_DIR}/main-window.tsx`
  },

  output: {
    path: DIST_DIR,
    filename: '[name].js'
  },

  target: 'electron',

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [APP_DIR, STATIC_DIR, 'node_modules'],
    symlinks: false
  },

  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              logInfoToStdOut: true,
              logLevel: 'debug',
              colors: true
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          'css-loader?url=false',
          'resolve-url-loader',
          'sass-loader?sourceMap'
        ]
      },
      {
        test: /\.node$/,
        loader: 'node-loader'
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'main-window.html',
      hash: false,
      template: `${APP_DIR}/main-window.html`,
      chunks: ['main-window']
    })
  ],

  devtool: 'source-map',

  node: {
    __dirname: false,
    __filename: false
  }
}
