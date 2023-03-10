import Router from 'koa-router'
import checkToken from "../middlewares/checkToken";
import {
  listNotice,
  readNotice,
  rmNotice,
  unreadNotice
} from "../services/noticeService";
import jsonResp from "../lib/stats";
import validate from "../lib/validate";
import Joi from "joi";


export const noticeRouter = new Router({
  prefix: '/api/notice',
})

noticeRouter.get("/list",
  checkToken(),
  async ctx => {
    const { userId } = ctx.state as { userId: string }
    const notices = await listNotice(userId)
    ctx.body = jsonResp(notices)
  }
)


noticeRouter.post("/rm",
  checkToken(),
  async ctx => {
    const {
      noticeId
    } = validate(ctx.request.body, Joi.object({
      noticeId: Joi.string().length(24).required(),
    })) as {
      noticeId: string
    }
    const { ok } = await rmNotice(noticeId)
    ctx.body = jsonResp({ ok })
  }
)

noticeRouter.post('/read',
  checkToken(),
  async ctx => {
    const { userId } = ctx.state as { userId: string }
    const {
      noticeId
    } = validate(ctx.request.body, Joi.object({
      noticeId: Joi.string().length(24).required(),
    })) as { noticeId: string }
    const { ok } = await readNotice(noticeId)
    ctx.body = jsonResp({ ok })
  })

noticeRouter.post('/unread',
  checkToken(),
  async ctx => {
    const { userId } = ctx.state as { userId: string }
    const {
      noticeId
    } = validate(ctx.request.body, Joi.object({
      noticeId: Joi.string().length(24).required(),
    })) as { noticeId: string }
    const { ok } = await unreadNotice(noticeId)
    ctx.body = jsonResp({ ok })
  })

noticeRouter.post('/test/add', async (ctx) => { })
