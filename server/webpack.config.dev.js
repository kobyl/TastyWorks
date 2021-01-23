let opts = require("./webpack.config.base.js");

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: path.join(__dirname, "index.html"),
  filename: "./index.html"
});

opts = {
  ...opts,
  entry: path.resolve(__dirname, "src", "index.tsx"),
  mode: "development",
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [htmlWebpackPlugin]
};

module.exports = opts;
