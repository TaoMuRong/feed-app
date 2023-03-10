import { ErrorStat } from '../lib/stats'

/**
 *  异常处理
 * @param ctx
 * @param next
 */
export default function checkError() {
  return async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      if (error instanceof ErrorStat) {
        ctx.status = error.status
        ctx.body = error
        ctx.state.logs = error.toJSON()
      } else {
        throw error
      }
    }
  }
}
