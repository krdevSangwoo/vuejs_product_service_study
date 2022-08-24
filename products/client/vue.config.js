const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

// node.js server 포트번호 3000 -> 향후 서버 url을 넣어주면 될듯
const target = 'http://127.0.0.1:3000';

module.exports = {
  devServer: {
    port: 8080, // client 포트번호
    proxy: {
      '^/api': {
        target,
        changeOrigin: true
      }
    }
  }
}
// client에서 api가 포함되는 url로 요청 시 target에 설정된
// localhost 3000번 포트에 열린 서버에서 url에 대한 요청을 실행하도록 proxy 설정