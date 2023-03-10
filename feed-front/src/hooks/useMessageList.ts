import { useCallback, useEffect, useState } from 'react'
import { listUsersInMessage } from '../api/message'
import { IMsgInList } from '../libs/types'
import { IWsMsg, IWsMsgType } from './useWebsocket/types'

export function useMessageList(wsmessage?: IWsMsg | null) {
  const [messagesInList, setMessagesInList] = useState<IMsgInList[]>([])

  useEffect(() => {
    listUsersInMessage()
      .then((res) => res.data)
      .then((data) => {
        setMessagesInList(
          data.sort((a, b) => b.message.createdAt - a.message.createdAt)
        )
      })
  }, [])

  const refresh = useCallback(() => {
    listUsersInMessage()
      .then((res) => res.data)
      .then((data) => {
        setMessagesInList(
          data.sort((a, b) => b.message.createdAt - a.message.createdAt)
        )
      })
  }, [])

  useEffect(() => {
    if (!!wsmessage) {
      if (wsmessage.type === IWsMsgType.Message) {
        refresh()
      }
    }
  }, [refresh, wsmessage])

  return {
    messagesInList,
    refresh,
  }
}
