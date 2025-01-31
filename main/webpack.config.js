const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    content: './content.js',
    background: './background.js',
    popup: './popup.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  mode: 'development',
  devtool: 'source-map',
  optimization: {
    minimize: false
  },
  performance: {
    hints: false
  },
  plugins: [
    new Dotenv()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  chrome: "88"
                },
                modules: 'auto'
              }]
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.mjs'],
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']
  },
  experiments: {
    topLevelAwait: true
  }
};
