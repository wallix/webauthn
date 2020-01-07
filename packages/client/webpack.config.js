module.exports = [
  {
    module: {
      rules: [
        {
          test: /\.(m?js|ts)$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]]
            }
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
