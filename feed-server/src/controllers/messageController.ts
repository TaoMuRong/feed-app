import Router from 'koa-router'
import checkToken from '../middlewares/checkToken'
import validate from '../lib/validate'
import {
    getMsgsFromFriend,
    getMsgList,
    sendMessage,
    deleteOneMessage,
    readAllMessages,
    deleteAllMessage
} from "../services/messageService"
import jsonResp from "../lib/stats"
import Joi from "joi"
import { ContentType } from "../models"

const messageRouter = new Router({
    prefix: '/api/message',
})

messageRouter.get("/getUsers",
    checkToken(),
    async ctx => {
        const { userId } = ctx.state as { userId: string }
        const userList = await getMsgList(userId)
        ctx.body = jsonResp(userList)
    })


messageRouter.get("/getFriendsMessageList",
    checkToken(),
    async ctx => {
        const { userId } = ctx.state as { userId: string }
        const {
            friendId,
            prev,
            limit,
        } = validate(ctx.request.query, Joi.object({
            friendId: Joi.string().length(24).required(),
            prev: Joi.string().length(24).allow("").default(null),
            limit: Joi.number().min(1).max(100).allow("").default(null),
        })) as {
            friendId: string,
            prev: string | null,
            limit: number | null,
        }

        const msgList = await getMsgsFromFriend(userId, friendId, prev, limit)
        ctx.body = jsonResp(msgList)
    })

/**
 * @deprecated
 */
messageRouter.post("/send",
    checkToken(),
    async ctx => {
        const { userId } = ctx.state as { userId: string }
        const {
            content,
            contentType,
            toId,
        } = validate(ctx.request.body, Joi.object({
            content: Joi.string().required(),
            contentType: Joi.number().default(ContentType.Text), // 文字或图片
            toId: Joi.string().required(),
        })) as {
            content: string,
            contentType: ContentType,
            toId: string,
        }
        const { ok } = await sendMessage(userId, toId, content, contentType,)
        ctx.body = jsonResp({ ok })
    }
)

messageRouter.post("/deleteOneMessage/:messageId",
    checkToken(),
    async ctx => {
        const { userId } = ctx.state as { userId: string }
        const {
            messageId
        } = validate(ctx.params, Joi.object({
            messageId: Joi.string().required()
        })) as {
            messageId: string
        }
        const { ok } = await deleteOneMessage(userId, messageId)
        ctx.body = jsonResp({ ok })
    })

messageRouter.post("/readAll/:friendId",
    checkToken(),
    async ctx => {
        const { userId } = ctx.state as { userId: string }
        const {
            friendId
        } = validate(ctx.params, Joi.object({
            friendId: Joi.string().required()
        })) as {
            friendId: string
        }
        const { ok } = await readAllMessages(userId, friendId)
        ctx.body = jsonResp({ ok })
    })

messageRouter.post("/deleteOneMessageList/:friendId",
    checkToken(),
    async ctx => {
        const { userId } = ctx.state as { userId: string }
        const {
            friendId
        } = validate(ctx.params, Joi.object({
            friendId: Joi.string().required()
        })) as {
            friendId: string
        }
        const { ok } = await deleteAllMessage(userId, friendId)
        ctx.body = jsonResp({ ok })
    })


export default messageRouter
