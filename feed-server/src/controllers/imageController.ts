import Router from "koa-router"
import jsonResp from "../lib/stats"
import validate from "../lib/validate"
import Joi from "joi"
import { getOssClient } from "../lib/aliyunOSS"

const imageRouter = new Router({
    prefix: "/api/img",
})

imageRouter.post("/upload", async (ctx) => {
    const { imgName } = validate(
        ctx.request.body,
        Joi.object({
            imgName: Joi.string().required(),
        })
    ) as { imgName: string }

    const url = getOssClient().signatureUrl(`imgs/${imgName}`, {
        // 设置过期时间，默认值为1800秒。
        expires: 3600,
        // 设置请求方式为PUT。默认请求方式为GET。
        method: "PUT",
        "Content-Type": "image",
    })

    ctx.body = jsonResp({ url })
})

// type: default or origin
imageRouter.get("/download", async (ctx) => {
    const { type, imgUrl } = validate(
        ctx.request.query,
        Joi.object({
            type: Joi.string().default("default"),
            imgUrl: Joi.string().required(),
        })
    ) as {
        type: string,
        imgUrl: string
    }
    // download url
    // const url = `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${imgUrl}`
    const url = getOssClient().signatureUrl(`imgs/${imgUrl}`, {
        expires: 3600, // 设置过期时间，默认值为1800秒
        process: type === "default" ? "" : "image/resize,h_200", // 设置图片处理参数， `h_200` represent height=200px
    })
    ctx.body = jsonResp({ url })
})
export default imageRouter
