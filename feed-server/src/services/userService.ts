import * as db from '../database/mongo'
import { follows, users } from '../database/mongo'
import { IUser } from '../models'
import { ObjectId, WithId } from 'mongodb'
import { getFollowInfo } from './followService'
import { UserInfoWithFollow, userInfoWithFollow } from '../models/users'

export async function getUserInfo(userId: string) {
  return users.findOne({ _id: new ObjectId(userId) })
}

export async function getUserInfoWithFollow(userId: string) {
  const userInfo = await getUserInfo(userId)
  const follow = await getFollowInfo(userId)
  return userInfoWithFollow(userInfo, follow)
}

export async function wrapUserInfoWithStatus(
  userId: string,
  userInfo: UserInfoWithFollow
) {
  const status = {
    // 是否被你关注
    isFollowed: !!(await follows.findOne({
      userId: new ObjectId(userId),
      followedId: userInfo._id,
    })),
    // 是否关注你
    isFollowYou: !!(await follows.findOne({
      userId: userInfo._id,
      followedId: new ObjectId(userId),
    })),
  }
  Reflect.set(userInfo, 'status', status)
  return userInfo
}

export async function getWxUserInfo(code: string) {
  const appid = process.env.APP_ID
  const appsecret = process.env.APP_SECURITY
  // 拿到wechat用户的`access_token`和`openid`
  const wxLoginUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${appsecret}&code=${code}&grant_type=authorization_code`
  const wxLoginResp = await fetch(wxLoginUrl)
  const wxLoginData = await wxLoginResp.json()
  const _wxLoginData = {
    accessToken: wxLoginData['access_token'],
    openId: wxLoginData['openid'],
    scope: wxLoginData['scope'],
    refreshToken: wxLoginData['refresh_token'],
  }
  if (!_wxLoginData.openId) return null
  // 判断是否已注册
  const userInfo = await getUserInfoByWxId(_wxLoginData.openId)
  if (userInfo === null) {
    // 根据用户 access_token 和 openid 获取 user info
    const wxUserInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${_wxLoginData.accessToken}&openid=${_wxLoginData.openId}&lang=zh_CN`
    const wxUserInfoResp = await fetch(wxUserInfoUrl)
    const wxUserInfoData = await wxUserInfoResp.json()
    return {
      _id: undefined,
      account: null,
      background: null,
      createdAt: -1,
      bio: '',
      wxId: wxUserInfoData['openid'],
      nickname: wxUserInfoData['nickname'],
      avatar: wxUserInfoData['headimgurl'],
    }
  }
  // 用户已存在
  else {
    return getUserInfoWithFollow(userInfo._id.toString())
  }
}

async function getUserInfoByWxId(wxId: string): Promise<WithId<IUser> | null> {
  return db.users.findOne({ wxId: wxId })
}

// FIXME: for test
export async function getUserByAccountForTest(
  account: string
): Promise<WithId<IUser> | null> {
  return db.users.findOne({ account })
}

export async function createUser(
  user: IUser
): Promise<{ ok: boolean; userInfo: WithId<IUser> }> {
  user.createdAt = Date.now()

  if (await db.users.findOne({ account: user.account })) {
    return { ok: false, userInfo: null }
  }

  const insertRes = await db.users.insertOne(user)
  const _id = insertRes.insertedId
  const userInfo: WithId<IUser> = {
    _id,
    account: user.account,
    avatar: user.avatar,
    background: user.background,
    createdAt: user.createdAt,
    bio: user.bio,
    nickname: user.nickname,
    wxId: user.wxId,
  }
  return {
    ok: true,
    userInfo,
  }
}

/**
 * 修改个人信息
 * @param userInfo
 */
export async function chUserInfo(userInfo: WithId<IUser>) {
  const res = await users.replaceOne({ _id: userInfo._id }, userInfo)
  return {
    ok: res.acknowledged,
  }
}

export async function getUserIdByAccount(account: string) {
  const user = await users.findOne({ account: account })
  if (!user) return null
  return user._id.toString()
}
