import Router from "koa-router";
import validate from "../lib/validate";
import Joi from "joi";
import {
  searchPostWithUserAndStatus,
  searchUserWithStatus
} from "../services/searchService";
import jsonResp from "../lib/stats";
import checkToken from "../middlewares/checkToken";

const searchRouter = new Router({
  prefix: '/api/search',
})

// pass
searchRouter.get('/user',
  checkToken(),
  async ctx => {
    const { userId } = ctx.state as { userId: string }
    const {
      words
    } = validate(ctx.request.query, Joi.object({
      words: Joi.string().required()
    })) as {
      words: string
    }
    const users = await searchUserWithStatus(userId, words)
    ctx.body = jsonResp(users)
  })

// pass
searchRouter.get('/post',
  checkToken(),
  async ctx => {
    const { userId } = ctx.state as { userId: string }
    const {
      words,
      hasImage,
    } = validate(ctx.request.query, Joi.object({
      words: Joi.string().required(),
      hasImage: Joi.boolean().default(false),
    })) as {
      words: string, hasImage: boolean
    }
    const postList = await searchPostWithUserAndStatus(userId, words, hasImage)
    ctx.body = jsonResp(postList)
  })

export default searchRouter
