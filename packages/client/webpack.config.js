module.exports = [
  {
    module: {
      rules: [
        {
          test: /\.(m?js|ts)$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
          }
        }
      ]
    },
    resolve: {
        extensions: ['.js', '.ts'],
    },
    output: {
      filename: 'main.js',
      libraryTarget: 'umd',
      globalObject: 'this'
    }
  }
]
