import { useCallback, useEffect, useState } from 'react'
import { IWsMsg, IWsMsgType } from './useWebsocket/types'
import { IMessage } from '../libs/types'
import { getChatMessageList } from '../api/message'

export function useChatMessage(friendId: string, wsmessage?: IWsMsg | null) {
  const limit = 10
  const [messageList, setMessageList] = useState<IMessage[]>([])

  // 获取api数据
  const getMessages = useCallback(
    async (prev?: string | null, limit?: number) => {
      if (friendId) {
        const { data } = await getChatMessageList(friendId, prev, limit)
        return data
      }
      return []
    },
    [friendId]
  )

  // 初始加载数据
  useEffect(() => {
    getMessages(null, limit).then((data) => {
      if (data.length === limit) {
        setHasMore(true)
      } else {
        setHasMore(false)
      }
      setMessageList([...data, ...messageList])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getMessages])

  const [hasMore, setHasMore] = useState(false)
  const loadMore = async () => {
    const prev = messageList[0]._id as string
    const data = await getMessages(prev, limit)
    if (data.length === limit) {
      setHasMore(true)
    } else {
      setHasMore(false)
    }
    setMessageList([...data, ...messageList])
  }

  // websocket message
  const [newMessageNum, setNewMessageNum] = useState(0)
  useEffect(() => {
    if (!!wsmessage && wsmessage.type === IWsMsgType.Message) {
      const message = wsmessage.message as IMessage
      if (message.fromId === friendId || message.toId === friendId) {
        setNewMessageNum(newMessageNum + 1)
        setMessageList([...messageList, message])
      }
    }
    // eslint-disable-next-line
  }, [friendId, wsmessage])

  return {
    messageList,
    loadMore,
    hasMore,
    newMessageNum,
  }
}
