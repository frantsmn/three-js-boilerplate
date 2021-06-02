/* eslint-disable no-undef */

module.exports = {
    entry: {
        main: './src/index.js',
    },
    optimization: {
        minimize: true,
        usedExports: true,
    },
    devServer: {
        historyApiFallback: false,
        contentBase: './dist',
        open: true,
        compress: true,
        hot: true,
        port: 8080,
        quiet: false
    },
    mode: 'production',
    module: {
        rules: [{
            test: /\.m?js$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
            }
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
