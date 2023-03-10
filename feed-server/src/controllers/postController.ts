import Router from 'koa-router'
import validate from '../lib/validate'
import Joi from 'joi'
import * as postService from '../services/postService'
import jsonResp from '../lib/stats'
import checkToken from '../middlewares/checkToken'
import * as noticeService from '../services/noticeService'
import {
    getPostAuthorId,
    getPostWithUserAndStatus,
} from '../services/postService'
import { PostType } from "../models"

const postRouter = new Router({
    prefix: '/api/post',
})

// pass
postRouter.post('/add',
    checkToken(),
    async (ctx) => {
        const { userId } = ctx.state as { userId: string }
        const {
            type,
            relativeId,
            content,
            images
        } = validate(ctx.request.body, Joi.object({
            type: Joi.number().required(),
            relativeId: Joi.string().allow(null).allow('').default(''),
            content: Joi.string().allow(null).allow('').default(''),
            images: Joi.array().items(Joi.string()).default([] as string[]),
        })) as {
            type: number
            relativeId: string
            content: string
            images: string[]
        }
        const { ok, postId } = await postService.createPost(
            userId,
            type,
            relativeId,
            content,
            images
        )

        // 发送Notice
        let authorId
        switch (type) {
            case PostType.Comment:
                authorId = await getPostAuthorId(relativeId)
                noticeService.createNoticeAndSend(userId, authorId, '评论了您').then()
                break
            case PostType.Repost:
                authorId = await getPostAuthorId(relativeId)
                noticeService.createNoticeAndSend(userId, authorId, '转发了您的帖子').then()
                break
            case PostType.Default:
                break
        }
        ctx.body = jsonResp({ ok, postId })
    })

// pass
postRouter.get('/list', checkToken(), async (ctx) => {
    let { userId } = ctx.state as { userId: string }
    const {
        userId: userId_,
        default_,
        repost,
        comment,
        prev,
        next,
        limit,
    } = validate(ctx.request.query, Joi.object({
        userId: Joi.string().length(24).default(null),
        default_: Joi.boolean().default(true),
        repost: Joi.boolean().default(true),
        comment: Joi.boolean().default(false),
        prev: Joi.string().hex().length(24),
        next: Joi.string().hex().length(24),
        limit: Joi.number().integer().min(5).max(20).default(10),
    })) as {
        userId?: string
        default_: boolean
        repost: boolean
        comment: boolean
        prev: string
        next: string
        limit: number
    }
    if (userId_) userId = userId_

    const postList = await postService.listPostWithUserAndStatus(userId, {
        default_,
        repost,
        comment,
        prev,
        next,
        limit,
    })
    ctx.body = jsonResp(postList)
})

postRouter.get('/listComments', checkToken(), async (ctx) => {
    const { userId } = ctx.state as { userId: string }
    const {
        postId
    } = validate(ctx.request.query, Joi.object({
        postId: Joi.string().length(24).required(),
    })) as {
        postId: string
    }
    const postList = await postService.listCommentsWithUserAndStatus(postId, userId)
    ctx.body = jsonResp(postList)
})

postRouter.get('/getPost', checkToken(), async (ctx) => {
    const { postId } = validate(
        ctx.request.query,
        Joi.object({
            postId: Joi.string().length(24).required(),
        })
    ) as {
        postId: string
    }
    const post = await getPostWithUserAndStatus(postId)
    ctx.body = jsonResp(post)
})

postRouter.post('/like', checkToken(), async (ctx) => {
    const { userId } = ctx.state as { userId: string }
    const {
        postId
    } = validate(ctx.request.body, Joi.object({
        postId: Joi.string().length(24).required(),
    })) as {
        postId: string
    }

    const { ok, insertId, msg } = await postService.createLike(userId, postId)
    const authorId = await postService.getPostAuthorId(postId)
    // web socket
    await noticeService.createNoticeAndSend(userId, authorId, '点赞了您')

    ctx.body = jsonResp({ ok, insertId, msg })
})

postRouter.post('/cancelLike', checkToken(), async (ctx) => {
    const { userId } = ctx.state as { userId: string }
    const {
        postId
    } = validate(ctx.request.body, Joi.object({
        postId: Joi.string().length(24).required(),
    })) as {
        postId: string
    }
    const { ok } = await postService.cancelLike(userId, postId)
    ctx.body = jsonResp({ ok })
})

postRouter.post('/delete', checkToken(), async (ctx) => {
    const {
        postId
    } = validate(ctx.request.body, Joi.object({
        postId: Joi.string().length(24).required(),
    })) as {
        postId: string
    }
    const { ok } = await postService.rmPostByPostId(postId)
    ctx.body = jsonResp({ ok })
})

export default postRouter
