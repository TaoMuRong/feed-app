import { ObjectId, WithId } from 'mongodb'
import { IUser } from './index'
import { FollowInfo } from './follows'

export interface UserInfoWithFollow {
  _id: ObjectId
  // 账号
  account: string // begin at `@`
  // 微信id
  wxId: string // `wx` openId
  // 昵称
  nickname: string // from `wx`
  // 个人简介
  bio: string
  // 头像url
  avatar: string // url, from `wx`
  // 背景图url
  background: string // url
  // 创建时间
  createdAt: number
  follow: {
    followings: number // 关注数
    followeds: number // 粉丝数
  }
}

export function userInfoWithFollow(
  userInfo: WithId<IUser>,
  follow: FollowInfo
): UserInfoWithFollow {
  Reflect.set(userInfo, 'follow', follow)
  return userInfo as UserInfoWithFollow
}

export interface IUserInfoWithStatus {
  _id: string
  // 账号
  account: string // begin with `@`
  // 昵称
  nickname: string // from `wx`
  // 个人简介
  bio?: string
  // 头像url
  avatar: string // url, from `wx`
  // 创建时间
  createdAt: number

  status?: {
    isFollowed: boolean // 是否被你关注
    isFollowYou: boolean // 是否关注你
  }
}
