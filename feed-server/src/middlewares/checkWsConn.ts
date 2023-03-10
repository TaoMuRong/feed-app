import { Middleware } from 'koa-websocket'
import { Context, Next } from 'koa'
import validate from '../lib/validate'
import Joi from 'joi'
import { getUserInfo } from '../services/userService'

export function checkWsConn(): Middleware {
  return async (ctx: Context, next: Next) => {
    const { id } = validate(
      ctx.params,
      Joi.object({
        id: Joi.string().length(24).required(),
      })
    ) as {
      id: string
    }
    const userInfo = await getUserInfo(id)
    const account = userInfo.account

    ctx.state.userId = id
    ctx.state.account = account

    await next()
  }
}
