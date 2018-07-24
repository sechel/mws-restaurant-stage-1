const DefinePlugin = require('webpack').DefinePlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

const RESPONSIVE_SIZES = [250, 320, 400, 500, 640, 800];
const GDRIVE_API_KEY = 'AIzaSyA4PPJmgs2SFr05ux53ByeTl3fM0Zcp8z0';
const DIST_DIR = __dirname + '/dist';
const API_HOST = 'http://localhost:1337/';

module.exports = {
    mode: 'development',
    entry: {
        index: './src/main.ts',
        restaurant: './src/restaurant.ts'
    },
    output: {
        path: DIST_DIR,
        filename: 'js/[name].[hash].js'
    },
    resolve: {
        modules: [
            __dirname + '/node_modules'
        ],
        extensions: ['\.ts', '\.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader' }
                ]
            },
            {
                test: /\.(jpg|png)$/,
                use: [
                    {
                        loader: 'responsive-loader',
                        options: {
                            name: 'img/[name]-[width].[ext]',
                            sizes: RESPONSIVE_SIZES,
                            adapter: require('responsive-loader/sharp'),
                            quality: 65
                        }
                    }
                ]
            }
        ]
    },
    devtool: 'cheap-module-eval-source-map',
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
        new MiniCssExtractPlugin({
            filename: "[name].[hash].css",
            chunkFilename: "[id].[hash].css"
        }),
        new DefinePlugin({
            WEBPACK_GDRIVE_API_KEY: JSON.stringify(GDRIVE_API_KEY),
            WEBPACK_RESPONSIVE_SIZES: JSON.stringify(RESPONSIVE_SIZES),
            WEBPACK_API_HOST: JSON.stringify(API_HOST)
        }),
        new HtmlWebpackPlugin({
            template: './html/index.html',
            filename: 'index.html',
            excludeChunks: ['restaurant'],
            WEBPACK_GDRIVE_API_KEY: GDRIVE_API_KEY
        }),
        new HtmlWebpackPlugin({
            template: './html/restaurant.html',
            filename: 'restaurant.html',
            excludeChunks: ['index'],
            WEBPACK_GDRIVE_API_KEY: GDRIVE_API_KEY
        }),
        new CopyWebpackPlugin(['data/**/*', 'img/**/*', 'img-svg/**/*']),
        new CompressionPlugin(),
        new GenerateSW({
            skipWaiting: true,
            ignoreUrlParametersMatching: [/./],
            exclude: [
                new RegExp('^data\/'),
                new RegExp('^img\/'),
                new RegExp('\.gz$')
            ],
            runtimeCaching: [
                {
                    urlPattern: new RegExp(API_HOST),
                    handler: 'networkFirst',
                    options: {
                        cacheName: 'data-cache'
                    }
                },
                {
                    urlPattern: new RegExp('http\:\/\/127\.0\.0\.1\:8000\/img\/'),
                    handler: 'cacheFirst',
                    options: {
                        cacheName: 'image-cache'
                    }
                },
                {
                    urlPattern: new RegExp('.*\.googleapis\.com|.*\.gstatic\.com'),
                    handler: 'networkFirst',
                    options: {
                        cacheName: 'google-maps-cache'
                    }
                },
                {
                    urlPattern: new RegExp('.*\.fontawesome\.com'),
                    handler: 'cacheFirst',
                    options: { 
                        cacheName: 'font-cache'
                    }
                }
            ]
        }),
        new WebpackPwaManifest({
            name: 'Restaurant Reviews Progressive Web App',
            short_name: 'MWSApp',
            description: 'The Restaurant Reviews Progressive Web App',
            background_color: '#ffffff',
            theme_color: '#ffffff',
            icons: [
                {
                    src: __dirname + '/img/icon-large.png',
                    sizes: [96, 128, 192, 256, 384, 512]
                }
            ]
        })
    ]
};
