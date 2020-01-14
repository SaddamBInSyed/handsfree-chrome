const path = require('path')

module.exports = {
  outputDir: path.resolve(__dirname, '../chrome/dashboard/'),
  publicPath: '/chrome/dashboard/',
  filenameHashing: false,

  chainWebpack: (config) => {
    config.resolve.alias.set(
      'icons',
      path.resolve(__dirname, 'node_modules/vue-material-design-icons')
    )
  }
}
