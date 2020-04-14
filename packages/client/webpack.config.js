module.exports = [
  {
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]],
                plugins: [
                    "@babel/plugin-proposal-object-rest-spread",
                    "@babel/plugin-transform-spread"
                ]
            }
          }
        }
      ]
    },
    output: {
      filename: 'main.js',
      libraryTarget: 'umd',
      globalObject: 'this'
    },
    optimization: {
      minimize: false
    }
  }
]
