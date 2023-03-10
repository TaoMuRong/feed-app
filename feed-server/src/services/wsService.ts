import * as ws from 'ws'
import {
  IWsMsg,
  IWsMsgType,
  MessageMsg,
  notice2WsMsg,
  NoticeMsg,
} from '../models/websocket'
import { WithId } from 'mongodb'
import { ContentType, INotice } from '../models'
import { getUserIdByAccount, getUserInfo } from './userService'
import { userInfoWithStatus } from './followService'
import { WsMessageHandler } from '../lib/websocket'
import { printAsForm } from '../lib/printForm'

const allWsConnectionMap = new Map<string, ws[]>()

// 定时清理已关闭关闭的连接
setInterval(() => {
  allWsConnectionMap.forEach((conns, key) => {
    allWsConnectionMap[key] = conns.filter(
      (conn) => conn.readyState !== conn.CLOSED
    )
  })
}, 1000 * 60) // 1 min

/**
 * 订阅通知
 * @param userId
 * @param wss
 */
export function registerConnection(userId: string, wss: ws) {

  let time: NodeJS.Timeout
  // 2秒 `ping` 一次
  setInterval(() => {
    wss.ping()
    // 2秒内未收到 `pong`, 断开连接
    time = setTimeout(() => {
      wss.close()
    }, 2000)
    // 收到`pong`取消定时器
    wss.pong(() => {
      clearTimeout(time)
    })
  }, 2000)


  const jsonMessage = (msg: any) => JSON.stringify(msg)
  const sendMessage = (wss: ws) => (msg: any) => wss.send(jsonMessage(msg))
  const sendMsgToThisWs = sendMessage(wss)

  wss.onmessage = (e) => {
    try {
      WsMessageHandler.receiveMessage(e.data.toString())
        .handleMessage()
        .then((msg) => {
          WsMessageHandler.send(
            msg,
            (() => {
              // 这里只是私信功能
              const message = msg.message as MessageMsg
              const toConns = allWsConnectionMap.get(message.toId) ?? []
              const fromConns = allWsConnectionMap.get(message.fromId) ?? []
              return [...fromConns, ...toConns]
            })()
          )
        })
    } catch (err) {
      sendMsgToThisWs(err)
    }
  }

  // 将ws连接加入队列
  allWsConnectionMap.get(userId)?.push(wss) ??
    allWsConnectionMap.set(userId, [wss])
}

/**
 * 发布通知
 * @param notice
 */
export async function publishNotice(notice: WithId<INotice>) {

  const fromId = notice.fromId.toString()
  const userInfo = userInfoWithStatus(await getUserInfo(fromId))
  const msg = notice2WsMsg(notice, userInfo)

  WsMessageHandler
    .of(msg)
    .handleMessage()
    .then(msg => {
      const message = msg.message as NoticeMsg
      const conns = allWsConnectionMap.get(message.userId) ?? []
      WsMessageHandler.send(msg, conns)
    })
}

/* *
 * websocket manage
 */

let adminConnect: ws = null

/**
 * 注册管理命令
 * @param wss
 */
export function registerAdminConnection(wss: ws) {
  wss.send(JSON.stringify({ message: 'AdminMsg, please input' }))
  wss.on('message', (data) => {
    executeAdminMsg(data.toString()).then((res) => wss.send(res))
  })
  adminConnect = wss
}

// 执行管理命令
async function executeAdminMsg(command: string) {
  command = command.trim()
  if (command.startsWith('.')) {
    return executeMetaCommand(command)
  }
  return executeCommonCommand(command)
}
// 执行元命令
async function executeCommonCommand(command: string) {
  if (command.trim().startsWith('js')) {
    execJsCommand(command.trim())
    return
  }
  if (command.trim().startsWith('send notice ')) {
    command = command.trim()
    const words = command.split(' ')
    const account = words[words.length - 1]

    const userId = await getUserIdByAccount(account)
    if (!userId) return 'account not found'
    // 发送一个websocket消息
    const message: NoticeMsg = {
      _id: '',
      content: 'test',
      createdAt: Date.now(),
      from: { avatar: '', nickname: '', userId: '' },
      readed: false,
      userId,
    }
    const msg: IWsMsg = {
      code: 1,
      message,
      type: IWsMsgType.Admin,
    }
    WsMessageHandler.send(
      msg,
      (() => {
        return allWsConnectionMap?.get(userId) ?? []
      })()
    )

    return 'send success'
  }

  const msg: IWsMsg = {
    type: IWsMsgType.Admin,
    message: command,
  }

  WsMessageHandler.send(
    msg,
    (() => {
      const conns = []
      allWsConnectionMap.forEach((connections) =>
        connections.forEach((connection) => conns.push(connection))
      )
      return conns
    })()
  )
  return 'send success'
}

function execJsCommand(command: string) {
  const words = command.split(' ')
  let js = words[1]
  if (js === 'goto') {
    js = `window.location.href = '${words[2]}`
  }


  WsMessageHandler.send(
    {
      type: IWsMsgType.JS,
      message: js,
    },
    (() => {
      const conns = []
      allWsConnectionMap.forEach((connections) =>
        connections.forEach((connection) => conns.push(connection))
      )
      return conns
    })()
  )
}
const metaCommands = {
  exit: async () => {
    let count = 0
    allWsConnectionMap.forEach((wsList) => {
      wsList.forEach((wss) => {
        wss.close(1000, 'Connect close')
        count++
      })
    })
    allWsConnectionMap.clear()
    return `${count} connections exit.`
  },
  count: async () => {
    let count = 0
    allWsConnectionMap.forEach((wsList) => (count += wsList.length))
    return count.toString()
  },
  list: async () => {
    const connInfos = []

    for (const userId of allWsConnectionMap.keys()) {
      const userInfo = await getUserInfo(userId)
      connInfos.push({
        id: userId,
        nickname: userInfo.nickname,
        account: userInfo.account,
        conns: allWsConnectionMap.get(userId)?.length ?? 0
      })
    }

    return printAsForm(connInfos, ["id", "account", "conns", "nickname",])
  },
  alert: async () => {
    allWsConnectionMap.forEach((wsList) => {
      wsList.forEach((wss) => {
        const command = {
          type: IWsMsgType.JS,
          message: "alert('WARNING: 您的电脑已被植入木马！！！')"
        }
        wss.send(JSON.stringify(command))
      })
    })
    return "success"
  },
}

const metaCommand2handler = new Map<string, () => Promise<string>>()
  .set(".exit", metaCommands.exit)
  .set(".quit", metaCommands.exit)
  .set(".count", metaCommands.count)
  .set(".list", metaCommands.list)
  .set('.alert', metaCommands.alert)

async function executeMetaCommand(command: string) {
  const handler = metaCommand2handler.get(command)
  if (handler) return await handler()
  else return "meta command not exist."
}
