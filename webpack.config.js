// const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
    entry: {
        main: './src/index.js',

    },
    devServer: {
        historyApiFallback: true,
        contentBase: './dist',
        open: true,
        compress: true,
        hot: true,
        port: 8080,
        quiet: false
    },
    module: {


        rules: [{
            test: /\.m?js$/,
            // exclude: /(node_modules)/,
            use: ['babel-loader']
        },
        {
            test: /\.(frag|vert|glsl)$/,
            use: [
                {
                    loader: 'glsl-shader-loader',
                    options: {}
                }
            ]
        }]
    },
    // plugins: [new ESLintPlugin()],
}
