import 'dotenv/config'
import Koa from 'koa'
import KoaBody from 'koa-body'
import userRouter from './controllers/userController'
import imageRouter from './controllers/imageController'
import postRouter from './controllers/postController'
import wsRouter from './controllers/wsController'
import logger from './middlewares/logger'
import * as mongo from './database/mongo'
import checkError from './middlewares/checkError'
import searchRouter from './controllers/searchController'
import websockify from 'koa-websocket'
import wsLogger from './middlewares/wsLogger'
import { noticeRouter } from './controllers/noticeController'
import messageRouter from './controllers/messageController'
import * as redis from './database/redis'
import { syncFollowBetweenMongoAndRedis } from './services/followService'

const port = process.env.PORT
const ip = process.env.IP

const app = websockify(new Koa())

app
  .use(KoaBody({ multipart: true }))
  .use(logger())
  .use(checkError())
  .use(userRouter.routes())
  .use(imageRouter.routes())
  .use(postRouter.routes())
  .use(searchRouter.routes())
  .use(noticeRouter.routes())
  .use(messageRouter.routes())

// web socket
app.ws
  .use(wsLogger())
  .use(wsRouter.routes())

async function run() {
  await mongo.init()
  console.log('Mongo Client Connected.')
  await redis.init()
  console.log('Redis Client Connected.');
  await syncFollowBetweenMongoAndRedis()
  console.log('Sync Success');

  app.listen(port, () => {
    console.log(`Open HTTP Server on http://${ip}:${port}`)
  })
}

run()
  .catch(console.dir)
