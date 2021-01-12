module.exports = {
  context: __dirname,
  resolve: {
    extensions: [".ts", ".js", ".tsx", ".jsx"],
    modules: ["node_modules", "src"]
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: ["babel-loader", "ts-loader"],
        exclude: [/node_modules/]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg|woff|woff2|gif|ttf|eot|svg)$/,
        loader: "url-loader?prefix=./&limit=400000"
      }
    ]
  }
};
