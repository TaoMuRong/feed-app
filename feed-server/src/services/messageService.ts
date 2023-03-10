import { follows, messages } from '../database/mongo'
import { ObjectId, WithId } from 'mongodb'
import { ContentType, IMessage } from '../models'
import { getUserInfo } from './userService'

interface IMsgInList {
  user: {
    _id: string
    avatar: string
    nickname: string
    account: string
  }
  status: {
    isFollowed: boolean // 是否被你关注
    isFollowYou: boolean // 是否关注你
    // createddAt: number,
  }
  message: {
    lastMsg: string
    createdAt: number
    unreadedNumber: number
  }
}

// FIXME: 使用聚合操作
export async function getMsgList(userId: string): Promise<IMsgInList[]> {
  const msgList_ = await messages
    .aggregate<WithId<IMessage>>([
      { $match: { userId: new ObjectId(userId) } }, //  属于你的所有消息
    ])
    .toArray()
  const userIds1 = msgList_.map((msg) => msg.toId.toString())
  const userIds2 = msgList_.map((msg) => msg.fromId.toString())
  const userIds = new Set([...userIds1, ...userIds2])
  userIds.delete(userId)
  const msgList: IMsgInList[] = []
  for (const friendId of userIds) {
    const friendInfo = await getUserInfo(friendId)
    const user = {
      _id: friendInfo._id.toString(),
      avatar: friendInfo.avatar,
      nickname: friendInfo.nickname,
      account: friendInfo.account,
    }
    const status = {
      // 是否被你关注
      isFollowed: !!(await follows.findOne({
        userId: new ObjectId(userId),
        followedId: new ObjectId(friendId),
      })),
      // 是否关注你
      isFollowYou: !!(await follows.findOne({
        userId: new ObjectId(friendId),
        followedId: new ObjectId(userId),
      })),
    }

    const ms = await messages
      .aggregate<WithId<IMessage>>([
        { $match: { userId: new ObjectId(userId) } }, //  属于你的所有消息
        {
          $match: {
            $or: [
              { fromId: new ObjectId(friendId) },
              { toId: new ObjectId(friendId) },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray()

    const m = ms[0]
    const message: {
      lastMsg: string
      createdAt: number
      unreadedNumber: number
    } = {
      lastMsg: m.contentType === ContentType.Text ? m.content : '[图片]',
      createdAt: m.createdAt,
      unreadedNumber: ms.filter(
        (m) => m.fromId.toString() === friendId && !m.readed
      ).length, // 未读数目
    }
    const msg: IMsgInList = {
      user,
      status,
      message,
    }
    msgList.push(msg)
  }

  return msgList
}

export async function getMsgsFromFriend(
  userId: string,
  friendId: string,
  prev?: string | null,
  limit?: number
): Promise<WithId<IMessage>[]> {
  const limitCondition = limit ? { $limit: limit } : null
  const prevCondition = prev
    ? { $match: { _id: { $lt: new ObjectId(prev) } } }
    : null
  const reverseById = { $sort: { _id: -1 } }
  const sortById = { $sort: { _id: 1 } }
  const notEmpty = (v: any) => !!v

  const pipeline = [
    { $match: { userId: new ObjectId(userId) } }, //  属于你的所有消息
    {
      $match: {
        $or: [
          { fromId: new ObjectId(friendId) },
          { toId: new ObjectId(friendId) },
        ],
      },
    }, // 关于你这个朋友的消息
    prevCondition,
    reverseById,
    limitCondition,
    sortById,
  ].filter(notEmpty)

  return messages.aggregate<WithId<IMessage>>(pipeline).toArray()
}

export async function sendMessage(
  userId: string,
  toId: string,
  content: string,
  contentType: ContentType
) {
  const message: IMessage = {
    content,
    contentType,
    createdAt: Date.now(),
    fromId: new ObjectId(userId),
    readed: false,
    toId: new ObjectId(toId),
    userId: new ObjectId(userId),
  }
  // FIXME: 使用事务
  const message2 = { ...message }
  message2.userId = new ObjectId(toId)
  const res1 = await messages.insertOne(message)
  const res2 = await messages.insertOne(message2)
  return {
    ok: res1.acknowledged && res2.acknowledged,
  }
}

export async function deleteOneMessage(userId: string, messageId: string) {
  const res = await messages.findOneAndDelete({
    _id: new ObjectId(messageId),
    userId: new ObjectId(userId),
  })
  return {
    ok: res.ok,
  }
}

export async function readAllMessages(userId: string, friendId: string) {
  const res = await messages.updateMany(
    {
      userId: new ObjectId(userId),
      fromId: new ObjectId(friendId),
    },
    { $set: { readed: true } }
  )
  return {
    ok: res.acknowledged,
  }
}

export async function deleteAllMessage(userId: string, friendId: string) {
  const res = await messages.deleteMany({
    userId: new ObjectId(userId),
    $or: [{ fromId: new ObjectId(friendId) }, { toId: new ObjectId(friendId) }],
  })
  return {
    ok: res.acknowledged,
  }
}
