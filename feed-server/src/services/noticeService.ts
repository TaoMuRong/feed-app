import { INotice } from '../models'
import { ObjectId, WithId } from 'mongodb'
import { notices, users } from '../database/mongo'
import { publishNotice } from './wsService'

export async function createNoticeAndSend(
  fromId: string,
  toId: string,
  content: string
) {
  const notice: WithId<INotice> = {
    _id: undefined,
    content: content,
    createdAt: Date.now(),
    userId: new ObjectId(toId),
    fromId: new ObjectId(fromId),
    readed: false,
  }

  // 存入数据库
  const res = await notices.insertOne(notice)
  // 发送一个websocket消息
  await publishNotice(notice)

  return { ok: res.acknowledged, noticeId: res.insertedId }
}

export async function rmNotice(noticeId: string) {
  const res = await notices.deleteOne({ _id: new ObjectId(noticeId) })
  return {
    ok: res.acknowledged,
  }
}

export async function readNotice(noticeId: string) {
  const res = await notices.updateOne(
    { _id: new ObjectId(noticeId) },
    { $set: { readed: true } }
  )
  return {
    ok: res.acknowledged,
  }
}

export async function unreadNotice(noticeId: string) {
  const res = await notices.updateOne(
    { _id: new ObjectId(noticeId) },
    { $set: { readed: false } }
  )
  return {
    ok: res.acknowledged,
  }
}

export async function listNotice(userId: string) {
  const noticeList = await notices
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray()
  for (let i = 0; i < noticeList.length; i++) {
    noticeList[i] = await noticeWithFromInfo(noticeList[i])
  }
  return noticeList
}

async function noticeWithFromInfo(notice: WithId<INotice>) {
  const fromId = notice.fromId
  const user = await users.findOne({ _id: fromId })
  const from_ = {
    _id: user._id,
    nickname: user.nickname,
    avatar: user.avatar,
  }
  Reflect.set(notice, 'from', from_)
  return notice
}
