const webpack = require("webpack");
const OfflinePlugin = require("offline-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = (env, argv) => ({
  entry: {
    main: ["./src/main.tsx", "./src/global.scss"],
  },
  output: {
    filename: "[name].[chunkhash].immutable.js",
    path: __dirname + "/dist",
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      style: path.resolve(__dirname, "src/style"),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      __BUILD_DATE__: JSON.stringify(Date.now()),
      __MODE__: JSON.stringify(argv.mode),
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
      template: "index.html",
      filename: ".index.template.html",
    }),
    new CopyWebpackPlugin([
      {
        from: "public",
        to: "",
      },
      {
        from: path.join(
          path.dirname(require.resolve("@anontown/client-icon/package.json")),
          "dist",
        ),
        to: "",
      },
    ]),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    ...(argv.mode === "production"
      ? [new CompressionPlugin({ minRatio: Number.MAX_SAFE_INTEGER })]
      : []),
  ],
  module: {
    rules: [
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader",
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
      {
        test: /\.html?$/,
        loader: "html-loader",
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader?modules",
          },
          {
            loader: "sass-loader",
          },
        ],
      },
    ],
  },
  devtool: argv.mode === "development" ? "source-map" : false,
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks: "initial",
    },
  },
});
