const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer:{
    port: 8087,
    proxy:{
      '/phy':{
        target:"http://localhost:8088/phy",
        changeOrigin:true,
        pathRewrite:{
          '^/phy':''
        }
      }
    }
  }
})
