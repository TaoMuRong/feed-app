import { ISession } from '../models'
import crypto from 'crypto'
import { redis } from '../database/redis'

const createSid = crypto.randomUUID
const sessionTTL = 60 * 60 * 24 * 7 // 7 天过期

async function redisSetSession(sessionId: string, session: ISession) {
  const key = `session:${sessionId}`
  for (const prop of Reflect.ownKeys(session)) {
    await redis.hSet(key, prop.toString(), session[prop])
  }
  // 设置过期时间
  await redis.expire(key, sessionTTL)

}

async function redisGetUserIdByToken(token: string): Promise<string> {
  const key = `session:${token}`
  const userId = await redis.hGet(key, 'userId')
  if (!userId) { return null }
  // 设置过期时间
  await redis.expire(key, sessionTTL)
  return userId
}

export async function createSession(userId: string, ip: string) {
  const session: ISession = {
    sid: createSid(),
    userId,
    createdAt: Date.now(),
    ip,
  }
  await redisSetSession(session.sid, session)
  return session.sid
}

export const getUserIdByToken = redisGetUserIdByToken

export async function rmSession(token: string) {
  await redis.del(`session:${token}`)
  return {
    ok: true,
  }
}
