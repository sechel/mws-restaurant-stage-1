const HtmlWebpackPlugin = require('html-webpack-plugin')

const DIST_DIR = __dirname + '/dist';

module.exports = {
    mode: 'development',
    entry: {
        index: './js/main.js',
        restaurant: './js/restaurant.js'
    },
    output: {
        path: DIST_DIR,
        filename: 'js/[name].[hash].js'
    },
    module: {
        rules: [
            { 
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' }
                ]
            }
        ]
    },
    devServer: {
        contentBase: '.',
        compress: true,
        port: 8000
    },
    optimization: {
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './html/index.html',
            filename: 'index.html',
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            template: './html/restaurant.html',
            filename: 'restaurant.html',
            chunks: ['restaurant']
        })
    ]
};
