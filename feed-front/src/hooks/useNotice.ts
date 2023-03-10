import { useCallback, useEffect, useState } from 'react'
import { INotice } from '../libs/types'
import { listNotice } from '../api/notice'
import { IWsMsg, IWsMsgType } from './useWebsocket/types'

export function useNotice(wsmessage?: IWsMsg | null) {
  const [notices, setNotices] = useState<INotice[]>([])

  useEffect(() => {
    listNotice()
      .then((res) => res.data)
      .then((data) => {
        setNotices(data)
      })
  }, [])

  const refresh = useCallback(() => {
    listNotice()
      .then((res) => res.data)
      .then((data) => {
        setNotices(data)
      })
  }, [])

  // websocket message
  useEffect(() => {
    if (!!wsmessage) {
      if (wsmessage.type === IWsMsgType.Notice) {
        const newNotice = wsmessage.message as INotice
        setNotices([newNotice, ...notices])
      }
    }
    // eslint-disable-next-line
  }, [wsmessage])

  return {
    notices,
    refresh,
  }
}
