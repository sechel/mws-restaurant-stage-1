const DefinePlugin = require('webpack').DefinePlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

const GDRIVE_API_KEY = 'AIzaSyA4PPJmgs2SFr05ux53ByeTl3fM0Zcp8z0';
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
    devtool: 'source-map',
    devServer: {
        host: '127.0.0.1',
        port: 8000,
        contentBase: '.',
        compress: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        open: true
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 3000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    plugins: [
        new DefinePlugin({
            WEBPACK_GDRIVE_API_KEY: JSON.stringify(GDRIVE_API_KEY)
        }),
        new HtmlWebpackPlugin({
            template: './html/index.html',
            filename: 'index.html',
            excludeChunks: ['restaurant']
        }),
        new HtmlWebpackPlugin({
            template: './html/restaurant.html',
            filename: 'restaurant.html',
            excludeChunks: ['index']
        }),
        new CopyWebpackPlugin(['data/**/*', 'img/**/*']),
        new GenerateSW({
            skipWaiting: true,
            ignoreUrlParametersMatching: [/./],
            exclude: [
                new RegExp('^data\/'),
                new RegExp('^img\/')
            ],
            runtimeCaching: [
                {
                    urlPattern: new RegExp('^http://localhost:8000/data/'),
                    handler: 'staleWhileRevalidate',
                    options: {
                        cacheName: 'data-cache'
                    }
                },
                {
                    urlPattern: new RegExp('^http://127.0.0.1:8000/img/'),
                    handler: 'cacheFirst',
                    options: {
                        cacheName: 'image-cache'
                    }
                },         
                {
                    urlPattern: new RegExp('^https://maps.googleapis.com/|^https://maps.gstatic.com/'),
                    handler: 'networkFirst',
                    options: {
                        cacheName: 'google-maps-cache'
                    }
                }                       
            ]
        })
    ]
};
