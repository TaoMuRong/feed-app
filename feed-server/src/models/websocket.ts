import { ObjectId, WithId } from 'mongodb'
import { IMessage, INotice } from './index'
import { IUserInfoWithStatus } from './users'

export enum IWsMsgType {
  Admin,
  Notice = 1,
  Message,
  JS,
}

export interface NoticeMsg {
  _id: string
  userId: string
  createdAt: number
  content: string
  readed: boolean // 是否已读
  from: {
    userId: string
    nickname: string
    avatar: string
    status?: {
      isFollowed: boolean // 是否被你关注
      isFollowYou: boolean // 是否关注你
    }
  }
}

enum ContentType {
  Text = 1,
  Image,
}

export interface MessageMsg {
  content: string
  contentType: ContentType // 文字或图片
  fromId: string
  toId: string

  _id?: string
  userId?: string
  readed?: boolean
  createdAt?: number
}

export type AdminMsg = string

export interface IWsMsg {
  code?: number
  type: IWsMsgType
  message: NoticeMsg | MessageMsg | AdminMsg
}

// convert ws message to INotice, then insert into database.
export function wsMsg2Notice(wsMsg: IWsMsg): INotice {
  const msg = wsMsg.message as NoticeMsg
  return {
    content: msg.content,
    createdAt: Date.now(),
    fromId: new ObjectId(msg.from.userId),
    readed: msg.readed,
    userId: new ObjectId(msg.userId),
  }
}

// convert INotice to ws message, then forward
export function notice2WsMsg(
  notice: WithId<INotice>,
  userInfo: IUserInfoWithStatus
): IWsMsg {
  const message: NoticeMsg = {
    _id: notice._id.toString(),
    content: notice.content,
    createdAt: notice.createdAt,
    from: {
      avatar: userInfo.avatar,
      nickname: userInfo.nickname,
      userId: userInfo._id,
      status: userInfo.status,
    },
    readed: notice.readed,
    userId: notice.userId.toString(),
  }
  return {
    message,
    type: IWsMsgType.Notice,
  }
}

// convert ws message to two IMessage, then save all in database and forward the first message
export function wsMsg2MessageTwo(wsMsg: IWsMsg): IMessage[] {
  const msg = wsMsg.message as MessageMsg
  const message1: IMessage = {
    content: msg.content,
    contentType: msg.contentType,
    fromId: new ObjectId(msg.fromId),
    toId: new ObjectId(msg.toId),
    userId: new ObjectId(msg.toId),
    createdAt: Date.now(),
    readed: false,
  }

  const message2 = Object.assign({}, message1)
  message2.userId = new ObjectId(msg.fromId)
  return [message1, message2]
}

// convert IMessage to ws message, then forward.
export function message2WsMsg(message: WithId<IMessage>): IWsMsg {
  const wsMsgMessage: MessageMsg = {
    _id: message._id.toString(),
    content: message.content,
    contentType: message.contentType,
    createdAt: message.createdAt,
    fromId: message.fromId.toString(),
    readed: message.readed,
    toId: message.toId.toString(),
    userId: message.userId.toString(),
  }
  return {
    message: wsMsgMessage,
    type: IWsMsgType.Message,
  }
}
