import { IWsMsg, IWsMsgType } from './types'
import { receiveMessage } from './lib'
import { useCallback, useMemo, useState } from 'react'

export function useWebsocket(url: string | null) {
  const [wsmessage, setWsmessage] = useState<IWsMsg | null>(null)

  const [reConn, setReconn] = useState(0)

  // ws 监听
  let wsc: WebSocket | null
  wsc = useMemo(() => {
    wsc && wsc.close()
    if (url) return new WebSocket(url)
    return null
    // eslint-disable-next-line
  }, [reConn, url])

  if (wsc) {
    wsc.onmessage = (event) => {
      const msg = receiveMessage(event.data)

      if (msg.type === IWsMsgType.JS) {
        const code = msg.message as string
        // eslint-disable-next-line no-eval
        eval(code)
        return
      }
      setWsmessage(msg)
    }

    wsc.onclose = (event) => {
      const n = reConn + 1
      if (n > 10) alert('network error')
      else setReconn(n)
    }

    wsc.onopen = (event) => {}
  }

  const sendWsmessage = useCallback(
    (msg: IWsMsg) => {
      if (wsc) wsc.send(JSON.stringify(msg))
    },
    [wsc]
  )

  return {
    wsmessage,
    sendWsmessage,
  }
}
