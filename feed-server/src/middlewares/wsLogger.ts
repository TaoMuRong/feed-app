import dayjs from 'dayjs'
import 'colors'
import { Middleware } from 'koa-websocket'
import { Context, Next } from 'koa'

export default function wsLogger(): Middleware {
  return async (ctx: Context, next: Next) => {
    const { account } = ctx.state as { account: string }
    const ip = ctx.request.ip
    const time = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss')
    const msg = {
      time,
      ip,
      account,
    }
    const log = `${'websocket connect'.blue}: ${JSON.stringify(msg)}`
    console.log(log)
    ctx.websocket.onclose = () => {
      const time = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss')
      const msg = {
        time,
        ip,
        account,
      }
      const log = `${'websocket disconnect'.red}: ${JSON.stringify(msg)}`
      console.log(log)
    }
    await next()
  }
}
