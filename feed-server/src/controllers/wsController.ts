import Router from 'koa-router'
import {
  registerAdminConnection,
  registerConnection,
} from '../services/wsService'
import wsLogger from '../middlewares/wsLogger'
import { checkWsConn } from '../middlewares/checkWsConn'
import ws from 'ws'
import validate from '../lib/validate'
import Joi from 'joi'

const wsRouter = new Router({
  prefix: '/ws',
}) as any

wsRouter.all('/conn/:id', checkWsConn(), wsLogger(), async (ctx) => {
  const { userId } = ctx.state as { userId: string }
  registerConnection(userId, ctx.websocket)
})

// admin
wsRouter.all('/admin', wsLogger(), async (ctx) => {
  registerAdminConnection(ctx.websocket)
})

export const loginConns = new Map<string, ws>()
wsRouter.all('/login/:id',
  async ctx => {
    const {
      id
    } = validate(ctx.params, Joi.object({
      id: Joi.string().required(),
    })) as {
      id: string,
    }
    const wss: ws = ctx.websocket
    loginConns.set(id, wss)
    setTimeout(() => wss.close(), 30000)
    wss.onclose = e => {
      loginConns.set(id, null)
    }
  }
)



export default wsRouter