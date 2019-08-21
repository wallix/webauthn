module.exports = [
  {
    output: {
      filename: 'main.js'
    }
  },
  {
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3}]]
            }
          }
        }
      ]
    },
    output: {
      filename: 'main.umd.js',
      libraryTarget: 'umd',
      globalObject: 'this'
    }
  }
]