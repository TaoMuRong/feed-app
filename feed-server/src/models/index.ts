import { ObjectId } from 'mongodb'

export interface IUser {
  // _id: ObjectId,
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
}

export interface ISession {
  // _id: ObjectId,
  // session _id
  sid: string
  // user _id
  userId: string,
  // session创建时间
  createdAt: number // 创建时间
  // 用户ip
  ip: string // 登录的ip
}

export interface IFollow {
  // 关注者id
  userId: ObjectId
  // 被关注者id
  followedId: ObjectId
  // 关注时间
  createdAt: number
}

export enum PostType {
  Default = 1,
  Comment = 2,
  Repost = 3,
}

export interface IPost {
  // 用户Id
  userId: ObjectId
  // 帖子类型
  type: PostType
  // 关联的帖子
  relativeId: ObjectId | null
  // 创建时间
  createdAt: number
  // 内容
  content: string
  // 图片 `url`列表
  images: string[]
  // 转发数
  reposts: number
  // 评论数
  comments: number
  // 喜欢数
  likes: number
  // 是否删除
  isDeleted: boolean
}

export interface ILike {
  // 用户id
  userId: ObjectId
  // 帖子 _id
  postId: ObjectId
  // 创建时间
  createAt: number
}

export interface INotice {
  // _id: ObjectId,
  userId: ObjectId
  fromId: ObjectId
  createdAt: number
  content: string
  readed: boolean // 是否已读
}

export enum ContentType {
  Text = 1,
  Image,
}

export interface IMessage {
  // _id: ObjectId,
  userId: ObjectId
  content: string
  contentType: ContentType // 文字或图片
  fromId: ObjectId
  toId: ObjectId
  readed: boolean // 是否已读
  createdAt: number
}
