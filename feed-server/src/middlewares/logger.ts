import { Context, Middleware, Next } from 'koa'
import dayjs from 'dayjs'
import 'colors'

export default function logger(): Middleware {
  return async (ctx: Context, next: Next) => {
    const startTime = Date.now()
    await next()
    const cost = `${Date.now() - startTime}ms`
    const logs = ctx.state.logs || {}
    const url = ctx.request.url
    const body = ctx.request.body
    const ip = ctx.request.ip
    const method = ctx.request.method.toUpperCase()
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const status = ctx.status
    const msg = {
      time,
      ip,
      method,
      url,
      body,
      status,
      cost,
      ...logs,
    }
    let log = `Log: ${JSON.stringify(msg)}`
    log = status < 300 ? log : log.red
    console.log(log)
  }
}
