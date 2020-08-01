const webpack = require("webpack");
const OfflinePlugin = require("offline-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const CompressionPlugin = require("compression-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

function match(x, map) {
  return map[x]();
}

module.exports = (env, argv) => {
  const enableBff = Boolean(env && env["enable-bff"]);

  if (!enableBff && argv.mode === "production") {
    throw new Error("bff must be enabled for production builds.");
  }

  return {
    entry: {
      main: ["./src/main.tsx", "./src/global.scss"],
    },
    output: {
      filename: "[name].[chunkhash].immutable.js",
      path: __dirname + "/public-dist",
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
        __ENABLE_BFF__: JSON.stringify(enableBff),
        ...(!enableBff ? { __RAW_ENV__: JSON.stringify(process.env) } : {}),
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
        inject: false,
        template: "index.ejs",
        filename: enableBff ? ".index.ejs" : "index.html",
        templateParameters: enableBff
          ? {
              enableBff: true,
            }
          : {
              enableBff: false,
            },
      }),
      new FaviconsWebpackPlugin({
        logo: "./icon.svg",
        cache: true,
        prefix: "assets/",
        inject: true,
        mode: "webapp",
        devMode: "webapp",
        favicons: {
          appName: "Anontown",
          appDescription: "高機能匿名掲示板Anontown",
          background: "#006400",
          theme_color: "#00ff00",
          icons: {},
        },
      }),
      new CopyWebpackPlugin([
        {
          from: "public",
          to: "",
        },
      ]),
      new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
      ...match(argv.mode, {
        production: () => [
          new CompressionPlugin({ minRatio: Number.MAX_SAFE_INTEGER }),
        ],
        development: () => [],
      }),
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
          use: [
            {
              loader: "ts-loader",
              options: {
                projectReferences: true,
              },
            },
          ],
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
    devtool: match(argv.mode, {
      production: () => false,
      development: () => "source-map",
    }),
    optimization: {
      splitChunks: {
        name: "vendor",
        chunks: "initial",
      },
    },
    devServer: !enableBff
      ? {
          contentBase: path.join(__dirname, "public"),
          port: process["PORT"] || 3000,
          historyApiFallback: true,
        }
      : undefined,
  };
};
