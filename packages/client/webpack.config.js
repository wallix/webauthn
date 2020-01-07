module.exports = [
    {
        resolve: {
            extensions: ['.ts'],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'ts-loader',
                    }
                }
            ]
        },
        output: {
            filename: 'main.js',
            libraryTarget: 'commonjs',
            globalObject: 'this'
        }
    }
]
