const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer:{
    port: 8081,
    proxy:{
      '/api':{
        target:"http://localhost:8080/api",
        changeOrigin:true,
        pathRewrite:{
          '^/api':''
        }
      }
    }
  }
})

// module.exports = {
//   devServer: {
//     port: 8081
//   }
// }
