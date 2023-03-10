import { IWsMsg } from './types'

/**
 * 接受处理msg
 * @param msgStr ws 接受的msg字符串
 */
export function receiveMessage(msgStr: string): IWsMsg {
  return JSON.parse(msgStr) as IWsMsg
}
