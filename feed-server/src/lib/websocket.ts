import { WithId } from 'mongodb'
import { messages } from '../database/mongo'
import { IMessage } from '../models'
import {
  IWsMsg,
  IWsMsgType,
  wsMsg2MessageTwo,
  message2WsMsg,
} from '../models/websocket'
import { stats } from './stats'
import * as ws from 'ws'

export class WsMessageHandler {
  private readonly msg: IWsMsg
  public constructor(msg: IWsMsg) {
    this.msg = msg
  }

    public static of(msg: IWsMsg) {
        return new WsMessageHandler(msg)
    }

  public getMsg() {
    return this.msg
  }

  /**
   * 接受处理msg
   * @param msgStr ws 接受的msg字符串
   */
  public static receiveMessage(msgStr: string): WsMessageHandler {
    try {
      const message = JSON.parse(msgStr) as IWsMsg
      return new WsMessageHandler(message)
    } catch (e) {
      throw stats.ErrorWsMsgSyntaxError
    }
  }

  public async handleMessage(): Promise<IWsMsg> {
    const type = this.msg.type
    const wsMessage = this.msg
    // 存到数据库
    if (type === IWsMsgType.Message) {
      const [message1, message2] = wsMsg2MessageTwo(wsMessage)
      // message1 和 message save in database
      // message1 will forward
      await messages.insertOne(message1)
      await messages.insertOne(message2)
      return message2WsMsg(message1 as WithId<IMessage>)
    }

        return this.msg
    }

  public static send(msg: IWsMsg, conns: ws[]) {
    conns.forEach((wss) => {
      wss.send(JSON.stringify(msg))
    })
  }
}
