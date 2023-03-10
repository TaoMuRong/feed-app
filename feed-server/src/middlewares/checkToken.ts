import { Context, Next } from 'koa'
import { stats } from '../lib/stats'
import { getUserIdByToken } from '../services/sessionService'

export default function checkToken() {
  return async (ctx: Context, next: Next) => {
    const token = ctx.cookies.get('token')
    ctx.state.token = token
    if (!token || token.trim() === '') {
      ctx.cookies.set('token', null)
      throw stats.ErrorUserNotLogin
    }
    const userId = await getUserIdByToken(token)
    if (!userId) {
      ctx.cookies.set('token', null)
      throw stats.ErrorTokenException
    }
    ctx.state.userId = userId
    await next()
  }
}
