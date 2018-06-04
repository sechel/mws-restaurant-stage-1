const DefinePlugin = require('webpack').DefinePlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

const RESPONSIVE_SIZES = [250, 320, 500, 640, 800];
const RESPONSIVE_BOUNDARIES = '(max-width: 320px) 250px, (min-width: 321px) and (max-width: 400px) 320px, (min-width: 401px) and (max-width: 575px) 500px, (min-width: 576px) and (max-width: 767px) 320px, (min-width: 768px) and (max-width: 919px) 250px, 320px';
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
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: { presets: ['env'] }
                }
            },
            { 
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' }
                ]
            },
            {
                test: /\.jpg$/,
                use: [
                    {
                        loader: 'responsive-loader',
                        options: {
                            name: 'img/[name]-[width].[ext]',
                            sizes: RESPONSIVE_SIZES,
                            adapter: require('responsive-loader/sharp')
                        }
                    }
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
            WEBPACK_GDRIVE_API_KEY: JSON.stringify(GDRIVE_API_KEY),
            WEBPACK_RESPONSIVE_SIZES: JSON.stringify(RESPONSIVE_SIZES),
            WEBPACK_RESPONSIVE_BOUNDARIES: JSON.stringify(RESPONSIVE_BOUNDARIES)
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
