let baseOpts = require("./webpack.config.base.js");
var webpack = require("webpack");
var path = require("path");
var fs = require("fs");
var nodeExternals = require("webpack-node-externals");

/* helper function to get into build directory */
var libPath = function(name) {
  if (undefined === name) {
    return "dist";
  }

  return path.join("dist", name);
};

/* helper to clean leftovers */
var outputCleanup = function(dir) {
  if (false == fs.existsSync(libPath())) {
    return;
  }

  var list = fs.readdirSync(dir);
  for (var i = 0; i < list.length; i++) {
    var filename = path.join(dir, list[i]);
    var stat = fs.statSync(filename);

    if (filename == "." || filename == "..") {
      // pass these files
    } else if (stat.isDirectory()) {
      // outputCleanup recursively
      outputCleanup(filename, false);
    } else {
      // rm fiilename
      fs.unlinkSync(filename);
    }
  }
  fs.rmdirSync(dir);
};

/* precentage handler is used to hook build start and ending */
var percentage_handler = function handler(percentage, msg) {
  if (0 === percentage) {
    /* Build Started */
    outputCleanup(libPath());
    console.log("Build started... Good luck!");
  }
};

var webpack_opts = {
  ...baseOpts,

  entry: "./src/exports.ts",
  target: "node",
  mode: "development",
  output: {
    filename: "node.js",
    path: path.resolve(__dirname, "dist")
  },
  externals: [nodeExternals()],
  plugins: [
    //    new webpack.optimize.UglifyJsPlugin({ sourceMap: true }),
    new webpack.ProgressPlugin(percentage_handler)
  ],
  devtool: "source-map"
};

module.exports = webpack_opts;
