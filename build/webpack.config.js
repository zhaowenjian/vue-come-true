const path =  require('path')
const Webpack =  require('webpack')
const HtmlWebpackPlugin =  require('html-webpack-plugin')

module.exports = {
  entry: {
    js: path.resolve(__dirname, '../src/main.js'),
    ts: path.resolve(__dirname, '../src/ts/main.ts')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].vue.js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['stage-2']
        }
      }
    }, {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'ts-loader',
        options: {

        }
      }
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      inject: 'head',
      chunks: ['js']
    }),
    new HtmlWebpackPlugin({
      template: 'src/indexTs.html',
      filename: 'indexTs.html',
      inject: 'head',
      chunks: ['ts']
    }),
    new Webpack.HotModuleReplacementPlugin()
  ],
  devtool: "source-map",
  devServer: {
    contentBase: path.resolve(__dirname, "dist"),
    compress: true,
    port: 9000
  }
}