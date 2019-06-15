const webpack = require("webpack");
const OfflinePlugin = require("offline-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require("path");

module.exports = {
    entry: {
        main: [
            './src/main.tsx',
            './src/global.scss'
        ]
    },
    output: {
        filename: "[name].[chunkhash].js",
        path: __dirname + "/dist",
        publicPath: '/'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            style: path.resolve(__dirname, 'src/style')
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            __PROD__: JSON.stringify(process.env.NODE_ENV === "PROD"),
            __BUILD_DATE__: JSON.stringify(Date.now()),
        }),
        new OfflinePlugin({
            caches: {
                main: [":rest:"],
            },
            ServiceWorker: {
                output: "sw.js",
                publicPath: "/sw.js",
                cacheName: "anontown",
                minify: true,
            },
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: 'index.html',
        }),
        new CleanWebpackPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.(graphql|gql)$/,
                exclude: /node_modules/,
                loader: 'graphql-tag/loader'
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.html?$/,
                loader: "html-loader"
            },
            {
                test: /\.s?css$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader?modules"
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            }
        ]
    },
    devtool: "source-map",
    devServer: {
        contentBase: 'public',
        port: 3000,
        host: '0.0.0.0',
        disableHostCheck: true,
        historyApiFallback: true
    },
    optimization: {
        splitChunks: {
            name: 'vendor',
            chunks: 'initial',
        }
    }
};
