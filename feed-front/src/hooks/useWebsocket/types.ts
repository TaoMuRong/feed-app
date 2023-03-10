import { IMessage, INotice } from '../../libs/types'

export enum IWsMsgType {
  Admin,
  Notice = 1,
  Message,
  JS,
}

export type AdminMsg = string

export interface IWsMsg {
  type: IWsMsgType
  message: INotice | IMessage | AdminMsg
}
