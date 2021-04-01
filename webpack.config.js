const path = require('path')

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, './src/core/index.js'),
  output: {
    library:"sims",
    libraryTarget:"window",
    libraryExport:"default",
    path: path.resolve(__dirname, 'dist'),
    filename: 'sims.js'
  },
  // module:{
  //   rules:[{
  //     test:/\.js$/,use:`babel-loader`,exclude:/node_modules/
  //   }]
  // }
}