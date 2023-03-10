import Router from 'koa-router'
import { IUser } from '../models'
import { ObjectId, WithId } from 'mongodb'
import {
  chUserInfo,
  createUser,
  getUserByAccountForTest,
  getUserInfoWithFollow,
  getWxUserInfo,
  wrapUserInfoWithStatus,
} from '../services/userService'
import { createSession, rmSession } from '../services/sessionService'
import jsonResp, { JsonResp, stats } from '../lib/stats'
import validate from '../lib/validate'
import Joi from 'joi'
import {
  cancelFollow,
  createFollow,
  getFollowsOrFans,
} from '../services/followService'
import checkToken from '../middlewares/checkToken'
import { createNoticeAndSend } from '../services/noticeService'
import * as postService from '../services/postService'
import { loginConns } from './wsController'

const appId = process.env.APP_ID

const userRouter = new Router({
  prefix: '/api/user',
})

/**
 * 登陆注册
 */
userRouter.get('/wxlogintest', async (ctx) => {
  const id = new ObjectId().toString()
  let redirectUri = `http://www.fadinglight.cn/api/user/redirectlogin?id=${id}`
  redirectUri = encodeURIComponent(redirectUri)
  ctx.body = new JsonResp({
    appId,
    uri: redirectUri,
    id,
  })
})

// 登录注册 pass
userRouter.get('/wxlogin', async (ctx) => {
  const id = new ObjectId().toString() // websocket id
  const redirectUri = encodeURIComponent(process.env.REDIRECT_URI + '?id=' + id)
  const wxUri = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`
  ctx.body = new JsonResp({
    wxUri,
    id,
  })
})
userRouter.get('/wxlogin2', (ctx) => {
  const redirectUri = encodeURIComponent(process.env.REDIRECT_URI + '2')
  const wxUri = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`
  ctx.body = new JsonResp({
    wxUri,
    appId,
  })
})

// pass
userRouter.get('/login', async (ctx) => {
  const { code, id } = validate(
    ctx.request.query,
    Joi.object({
      code: Joi.string().required(),
      id: Joi.string().required(),
    })
  ) as {
    code: string
    id: string
  }

  const userInfo: WithId<IUser> = await getWxUserInfo(code)
  const wss = loginConns.get(id)
  if (wss) {
    // if has registered，set token
    let token = ''
    if (userInfo.account)
      token = await createSession(userInfo._id.toString(), ctx.request.ip)
    wss.send(JSON.stringify({ userInfo, token }))
    ctx.body = `
        <h1>登录成功</h1>
        `
  } else {
    ctx.body = `<h1>登录超时，请刷新二维码</h1>`
  }
})

userRouter.get('/login2', async (ctx) => {
  const { code } = validate(
    ctx.request.query,
    Joi.object({
      code: Joi.string().required(),
    })
  ) as {
    code: string
  }

  const userInfo: WithId<IUser> = await getWxUserInfo(code)
  if (!userInfo) throw stats.ErrorUserNotFound
  // if has registered，set token
  if (userInfo.account)
    ctx.cookies.set(
      'token',
      await createSession(userInfo._id.toString(), ctx.request.ip)
    )
  ctx.body = jsonResp(userInfo)
})

// pass
userRouter.post('/register', async (ctx) => {
  const { userInfo } = validate(
    ctx.request.body,
    Joi.object({
      userInfo: Joi.object<WithId<IUser>>().required(),
    })
  ) as { userInfo: IUser }

  const { ok, userInfo: user } = await createUser(userInfo)
  if (!ok) ctx.body = jsonResp({ ok: false })
  else {
    // create a session
    const sessionId = await createSession(user._id.toString(), ctx.request.ip)
    ctx.cookies.set('token', sessionId)
    ctx.body = jsonResp({
      ok: true,
      userInfo,
    })
  }
})

userRouter.post('/logout', checkToken(), async (ctx) => {
  const { token } = ctx.state as { token: string }
  ctx.cookies.set('token', null)
  const { ok } = await rmSession(token)
  ctx.body = jsonResp({ ok })
})

// pass
/**
 * 关注
 */
userRouter.post('/follow',
  checkToken(),
  async ctx => {
    const { userId } = ctx.state as { userId: string }
    const {
      followedId
    } = validate(ctx.request.body, Joi.object({
      followedId: Joi.string().length(24).required(),
    })) as {
      followedId: string
    }

    const { ok, followId } = await createFollow(userId, followedId)
    await createNoticeAndSend(userId, followedId, "关注了您")

    ctx.body = jsonResp({ ok, followId })
  })

userRouter.post("/cancelFollow",
  checkToken(),
  async ctx => {
    const { userId } = ctx.state as { userId: string }
    const {
      followedId
    } = validate(ctx.request.body, Joi.object({
      followedId: Joi.string().length(24).required(),
    })) as {
      followedId: string
    }
    const { ok } = await cancelFollow(userId, followedId)
    ctx.body = jsonResp({
      ok
    })
  })

// pass
/**
 * 获取用户信息
 */
userRouter.get('/info',
  checkToken(),
  async ctx => {
    const { userId } = ctx.state as { userId: string }
    const {
      userId: userIdOther
    } = validate(ctx.request.query, Joi.object({
      userId: Joi.string().length(24).default(null),
    })) as {
      userId: string
    }
    let userInfo
    if (!userIdOther) userInfo = await getUserInfoWithFollow(userId)
    if (userIdOther) {
      userInfo = await getUserInfoWithFollow(userIdOther)
      userInfo = await wrapUserInfoWithStatus(userId, userInfo)
    }

    ctx.body = new JsonResp({ userInfo })
  })

/**
 *  修改个人信息
 */

userRouter.post('/chinfo', checkToken(), async (ctx) => {
  const { userId } = ctx.state as { userId: string }
  const { userInfo } = validate(
    ctx.request.body,
    Joi.object({
      userInfo: Joi.object<WithId<IUser>>().required(),
    })
  ) as {
    userInfo: WithId<IUser>
  }
  userInfo._id = new ObjectId(userId)
  const { ok } = await chUserInfo(userInfo)
  ctx.body = jsonResp({ ok })
})

userRouter.get(
  '/posts',
  // checkToken(),
  async (ctx) => {
    const { userId, hasImage } = validate(
      ctx.request.query,
      Joi.object({
        userId: Joi.string().length(24).required(),
        hasImage: Joi.boolean().default(false),
      })
    ) as {
      userId: string
      hasImage: boolean
    }
    const postList = await postService.listUserPostWithUserAndStatus(
      userId,
      hasImage
    )
    ctx.body = jsonResp(postList)
  }
)

userRouter.get(
  '/likes',
  // checkToken(),
  async (ctx) => {
    const { userId } = validate(
      ctx.request.query,
      Joi.object({
        userId: Joi.string().length(24).required(),
      })
    ) as {
      userId: string
    }
    const postList = await postService.listLikePostWithUserAndStatus(userId)
    ctx.body = jsonResp(postList)
  }
)

// 获取关注列表
userRouter.get('/followList', checkToken(), async (ctx) => {
  const meId = ctx.state.userId
  const { userId } = validate(
    ctx.request.query,
    Joi.object({
      userId: Joi.string().length(24).default(meId),
    })
  ) as {
    userId: string
  }
  const follows = await getFollowsOrFans(userId)
  ctx.body = jsonResp(follows)
})

// 获取粉丝列表
userRouter.get('/fansList', checkToken(), async (ctx) => {
  const meId = ctx.state.userId
  const { userId } = validate(
    ctx.request.query,
    Joi.object({
      userId: Joi.string().length(24).default(meId),
    })
  ) as {
    userId: string
  }
  const follows = await getFollowsOrFans(userId, true)
  ctx.body = jsonResp(follows)
})

// test login pass
userRouter.get('/test/login', async (ctx) => {
  const { account } = validate(
    ctx.request.query,
    Joi.object({
      account: Joi.string().required(),
    })
  ) as { account: string }
  const user = await getUserByAccountForTest(account)

  if (!user)
    ctx.body = jsonResp({
      ok: false,
    })
  else {
    // create a session
    const sessionId = await createSession(user._id.toString(), ctx.request.ip)
    ctx.cookies.set('token', sessionId)
    ctx.body = jsonResp({
      ok: true,
      userInfo: user,
    })
  }
})
export default userRouter
