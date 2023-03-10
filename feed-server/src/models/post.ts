import { ObjectId, WithId } from 'mongodb'
import { IUser } from './index'

export interface PostStatus {
  isLiked: boolean // 是否被你喜欢
  isReposted: boolean // 是否被你转发
  isCommented: boolean // 是否被你评论
}

export interface PostUser {
  _id: ObjectId
  avatar: string
  nickname: string
  account: string
}

export function userToPostUser(user: WithId<IUser>): PostUser {
  return {
    _id: user._id,
    account: user.account,
    avatar: user.avatar,
    nickname: user.nickname,
  }
}

export interface PostDTO {
  _id: ObjectId
  userId: ObjectId
  comments: number
  content: string
  createdAt: number
  images: string[]
  likes: number
  relativeId: ObjectId
  reposts: number
  type: number
}
