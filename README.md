# 项目线上地址

> 容器化应用，云计算平台部署
>
> 持续集成，持续部署
>
> websocket植入木马程序

[http://www.fadinglight.cn](http://www.fadinglight.cn)

打开方式：使用任意浏览器打开，若使用微信或者微信开发者工具可直接登录，若使用任意浏览器则需使用微信扫码登录。（ps：在浏览器测试和使用时最好使用Edge浏览器进行测试和调试，因为我们小组成员是在Edge浏览器中进行调试和开发，如果使用其他浏览器或者微信的浏览器有些样式会出现显示问题）

测试用户：胡涛，暖橘，一颗车厘子，可在搜索页搜索用户。

# 仓库项目启动步骤

下载相关依赖：`npm i`

前端项目启动：`npm run start`

后端项目启动: `npm run dev`

# 仓库项目依赖的环境和服务

如果想要本地启动项目需要修改的配置文件如下

前端：在`package.json`需要将proxy改为 `"proxy": "http://127.0.0.1:8080",`

后端：在`.env`文件中将配置项修改如下

```
# - server
PORT=8080
IP=0.0.0.0
# - weixin
APP_ID=wxd865f996ab9c8661
APP_SECURITY=3baa814bbf5b20efab574c6def6deaf0
# 微信重定向地址
REDIRECT_URI=http://127.0.0.1:8080/api/user/login
# - mongo
MONGO_URL=mongodb://[your_username]:[your_password]@127.0.0.1:27017/feed
# - aliyun oss
REGION=oss-cn-hangzhou
ACCESS_KEY_ID=LTAI5tKSyWyQKpgU695Hcpn9
ACCESS_KEY_SECRET=dcNTceTb13OrSEJY6w97SXNrkvAxhv
BUCKET=feed-fadinglight
```
