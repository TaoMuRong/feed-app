import { follows, users } from '../database/mongo'
import { IFollow, IUser } from '../models'
import { ObjectId, WithId } from 'mongodb'
import { IUserInfoWithStatus } from '../models/users'
import { redis } from '../database/redis'
import * as mongo from '../database/mongo'

// ============================== redis =============================

async function redisSetFollowAndFan(userId: string, followId: string) {
  // redis设置关注着
  const userKey = `${userId}:follows`
  // redis设置粉丝
  const followKey = `${followId}:fans`
  await redis.sAdd(userKey, followId)
  await redis.sAdd(followKey, userId)
}


async function redisDelFollowOrFan(userId: string, followId: string) {
  const userKey = `${userId}:follows`
  const followKey = `${followId}:fans`
  // 移除关注
  await redis.sRem(userKey, followId)
  // 移除粉丝
  await redis.sRem(followKey, userId)
}

async function redisGetFollows(userId: string) {
  const userKey = `${userId}:follows`
  return redis.sMembers(userKey)
}

async function redisGetFans(userId: string) {
  const userKey = `${userId}:fans`
  return redis.sMembers(userKey)
}

async function redisCountFollows(userId: string) {
  const userKey = `${userId}:follows`
  return redis.sCard(userKey)
}

async function redisCountFans(userId: string) {
  const userKey = `${userId}:fans`
  return redis.sCard(userKey)
}

async function redisExistsFollow(userId: string, followId: string) {
  const userKey = `${userId}:follows`
  return redis.sIsMember(userKey, followId)
}

async function redisExistsFan(userId: string, fanId: string) {
  const userKey = `${userId}:fans`
  return redis.sIsMember(userKey, fanId)
}
// =================================================================

// mongo和redis上的同步
export async function syncFollowBetweenMongoAndRedis() {
  const users = await mongo.users.find().toArray()
  for (const user of users) {
    const followsCursor = mongo.follows.aggregate<{ followedId: ObjectId }>([
      { $match: { userId: user._id } },
      { $project: { followedId: 1 } }
    ])

    const fansCursor = mongo.follows.aggregate<{ userId: ObjectId }>([
      { $match: { followedId: user._id } },
      { $project: { userId: 1 } }
    ])

    const followKey = `${user._id.toString()}:follows`
    const fanKey = `${user._id.toString()}:fans`

    for await (const follow of followsCursor) {
      const followId = follow.followedId.toString()
      redis.sAdd(followKey, followId)
    }

    for await (const fan of fansCursor) {
      const fanId = fan.userId.toString()
      redis.sAdd(fanKey, fanId)
    }
  }
}

export async function createFollow(userId: string, followedId: string) {
  const follow: IFollow = {
    createdAt: Date.now(),
    followedId: new ObjectId(followedId),
    userId: new ObjectId(userId),
  }
  const insertRes = await follows.insertOne(follow)
  await redisSetFollowAndFan(userId, followedId)

  return {
    ok: insertRes.acknowledged,
    followId: insertRes.insertedId,
  }
}

export async function cancelFollow(userId: string, followedId: string) {
  const res = await follows.findOneAndDelete({ userId: new ObjectId(userId), followedId: new ObjectId(followedId) })
  await redisDelFollowOrFan(userId, followedId)
  return { ok: res.ok, }
}

export async function getFollowInfo(userId: string): Promise<{ followeds: number; followings: number }> {
  return {
    followeds: await redisCountFans(userId),      // 被关注数，即粉丝数
    followings: await redisCountFollows(userId),  // 关注数
  }
}

export async function getFollowsOrFans(userId: string, fans = false) {
  const res: IUserInfoWithStatus[] = []
  let userIds = []
  // 获取关注userId列表
  if (!fans) { userIds = await redisGetFollows(userId) }
  // or 获取粉丝userId列表
  else { userIds = await redisGetFans(userId) }
  userIds = userIds.map(userId => new ObjectId(userId))

  const userInfos = await users.aggregate<WithId<IUser>>([
    { $match: { _id: { $in: userIds } } }
  ]).toArray()

  for (let _user of userInfos) {
    const user = userInfoWithStatus(_user)
    user.status = {
      // 是否被你关注, 是否是你的关注
      isFollowed: await redisExistsFollow(userId, user._id.toString()),
      // 是否关注你，是否是你的粉丝
      isFollowYou: await redisExistsFan(userId, user._id.toString()),
    }
    res.push(user)
  }
  return res
}

export function userInfoWithStatus(
  userInfo: WithId<IUser>
): IUserInfoWithStatus {
  return {
    _id: userInfo._id.toString(),
    account: userInfo.account,
    nickname: userInfo.nickname,
    avatar: userInfo.avatar,
    createdAt: userInfo.createdAt,
  }
}
