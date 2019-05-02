const path = require('path')
const webpack = require('webpack')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const paths = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
}

module.exports = {
  context: paths.src,
  entry: {
    'dfa-main': './dfa-main.js',
    're-main':  './re-main.js'
  },
  output: {
    filename: '[name].js',
    path: paths.dist,
    publicPath: 'dist',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
          options: { 
            presets: ['es2015', 'stage-0'], 
            plugins: ["transform-runtime"],
          }
        }],
      },
    ],
  },
  devServer: {
    contentBase: paths.dist,
    compress: true,
    port: '4800',
    stats: 'errors-only',
  },
  devtool: "#inline-source-map"
}
