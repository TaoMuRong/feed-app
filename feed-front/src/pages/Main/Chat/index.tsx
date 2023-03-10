import styles from './chat.module.scss'
import { ReactComponent as IconImg } from '../../../assets/imgs/pic.svg'
import {
  Button,
  Dialog,
  Divider,
  Input,
  NavBar,
  Popover,
  PullToRefresh,
} from 'antd-mobile'
import { ContentType, EmptyUser, IMessage } from '../../../libs/types'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { InputRef } from 'antd-mobile/es/components/input'
import { useNavigate, useParams } from 'react-router-dom'
import { useChatMessage } from '../../../hooks/useChatMessage'
import { getUserInfo } from '../../../api/user'
import { context } from '../../../hooks/store'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { IWsMsgType } from '../../../hooks/useWebsocket/types'
import { uploadOneImage } from '../../../libs/uploadImg'
import { deleteOneMessage, readAll } from '../../../api/message'
import { PullStatus } from 'antd-mobile/es/components/pull-to-refresh/pull-to-refresh'
import ShowPic from '../../../components/ShowPic'

enum FromType {
  Me = 1,
  You,
}

interface IMessageProps {
  id: string
  content: string
  contentType?: ContentType
  from: FromType
  date: number
  onDelete: () => void
}

const MessageComponent = (props: IMessageProps) => {
  const { id, content, contentType, from, date, onDelete } = props
  const { setImgVisible, setImgUrl } = useContext(context)

  const [showTime, setShowTime] = useState(dayjs(date).fromNow())
  setInterval(() => {
    setShowTime(dayjs(date).fromNow())
  }, 60 * 1000)

  let messageStyle: string
  switch (props.from) {
    case FromType.Me:
      messageStyle = styles.messageMe
      break
    case FromType.You:
      messageStyle = styles.messageYou
      break
  }

  const [visible, setVisible] = useState(false)

  //  一些点击事件
  // 长按显示先删除气泡
  // 但是长按会显示鼠标右键菜单
  // 所以需要屏蔽鼠标右键事件
  //* FIXME:更好的思路，定制右键菜单
  const chatRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    document.oncontextmenu = function (e) {
      /*屏蔽浏览器默认右键事件*/
      e = e || window.event
      return false
    }
  }, [])
  let timeout: NodeJS.Timeout
  const ontouchstart = () => {
    timeout = setTimeout(() => {
      setVisible(true)
      setTimeout(() => {
        setVisible(false)
      }, 2000)
    }, 300)
  }
  const ontouchend = () => {
    if (timeout) clearTimeout(timeout)
  }
  const ondelete = () => {
    onDelete()
    setVisible(false)
  }

  return (
    <div
      id={id}
      className={
        from === FromType.You
          ? styles.messageContainerLeft
          : styles.messageContainerRight
      }
    >
      <Popover
        content={<span onClick={ondelete}>删除</span>}
        visible={visible}
        mode="dark"
      >
        <div
          ref={chatRef}
          className={classNames(styles.message, messageStyle)}
          onTouchStart={ontouchstart}
          onTouchEnd={ontouchend}
        >
          {contentType === ContentType.Image ? (
            <img
              className={styles.imgMessage}
              onClick={() => {
                setImgVisible(true)
                setImgUrl(content)
              }}
              alt={'图片加载失败'}
              src={content}
            />
          ) : (
            <div className={styles.content}>{content}</div>
          )}
          <div className={styles.date}>{showTime}</div>
        </div>
      </Popover>
    </div>
  )
}

export default function Chat() {
  const navigate = useNavigate()
  const { _id } = useParams()
  const { userInfo, wsmessage, sendWsmessage, imgVisible } = useContext(context)
  const [friendInfo, setFriendInfo] = useState(EmptyUser)

  /* ***************************************************************
   *                            初始聊天内容                        *
   ******************************************************************/
  // 设置已读
  const read = useCallback(async () => {
    const unreadMessage = messages.filter((msg) => !msg.readed)
    unreadMessage.map((msg) => msg.readed === true)
    if (!!friendInfo._id) {
      await readAll(friendInfo._id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendInfo])

  useEffect(() => {
    if (!!_id) {
      getUserInfo(_id)
        .then((res) => res.data.userInfo)
        .then((data) => {
          setFriendInfo(data)
        })
    }
  }, [_id])
  // 来自server
  const { messageList, loadMore } = useChatMessage(friendInfo._id, wsmessage)
  const [messages, setMessages] = useState<IMessage[]>([])
  useEffect(() => {
    setMessages(messageList)
    read()
  }, [messageList, read])

  /* *****************************************************************
   *                           发送消息                                *
   ********************************************************************/
  const inputRef = useRef<InputRef>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const sendMessage = () => {
    const value = inputRef.current?.nativeElement?.value
    if (!!value && value.trim() !== '') {
      const message: IMessage = {
        contentType: ContentType.Text,
        fromId: userInfo._id,
        toId: friendInfo._id,
        createdAt: Date.now(),
        content: value,
      }
      sendWsmessage({ message, type: IWsMsgType.Message })
      // setMessages([...messages, message])
      inputRef.current.clear()
    }
  }
  const sendImage = async () => {
    const file = fileRef.current?.files![0] ?? null
    if (!file) return

    const handle = Dialog.show({
      content: '照片发送中请稍后',
    })
    try {
      //* upload the image, then return a uri
      const imgUri = await uploadOneImage(file)
      //* sendMessage wit the uri
      const message: IMessage = {
        content: imgUri,
        contentType: ContentType.Image,
        fromId: userInfo._id,
        toId: friendInfo._id,
        createdAt: Date.now(),
      }
      sendWsmessage({ message, type: IWsMsgType.Message })
      fileRef.current!.files = null
    } catch (err) {
      console.dir(err)
    } finally {
      handle.close()
    }
  }
  const selectImg = () => fileRef.current!.click()

  /* *****************************************************************
   *                          单个消息操作                            *
   ******************************************************************/
  /*
   * 1. 删除 finished
   * 2. 设置已读
   */
  const deleteMessage = (messageIdxInList: number) => {
    const deletedMessages = messages.splice(messageIdxInList, 1)
    setMessages([...messages])
    deleteOneMessage(deletedMessages[0]._id!)
  }

  /* ****************************************************************
   *                           聊天框的位置相关                        *
   *******************************************************************/
  /*
   * 1. 初始默认聊天框在最底部
   * 2. 如果是我发消息，都是定位到最下面
   * 3. 来了别人的新消息之后:
   *      3.1 如果在最底部，聊天框定位到最底部
   *      3.2 如果不在最底部，聊天框下方显示有新消息气泡，点击跳到最底部
   */
  const mainRef = useRef<HTMLElement>(null)

  const gotoBottom = useCallback(() => {
    const last = document.getElementById(messages[messages.length - 1]._id!)
    last!.scrollIntoView()
  }, [messages])
  // 1
  const [begin, setBegin] = useState(true)
  useEffect(() => {
    if (messages.length > 0 && begin) {
      gotoBottom()
      setBegin(false)
    }
  }, [begin, gotoBottom, messages])

  const [atBottom, setAtBottom] = useState(true)
  useEffect(() => {
    mainRef.current!.onscroll = (e) => {
      if (
        mainRef.current!.scrollTop ===
        mainRef.current!.scrollHeight - mainRef.current!.clientHeight
      ) {
        setAtBottom(true)
      } else {
        setAtBottom(false)
      }
    }
  }, [])

  // 判断是否有新消息
  const [lastMsg, setLastMsg] = useState<IMessage | null>(null)

  useEffect(() => {
    if (!lastMsg && messages.length > 0)
      setLastMsg(messages[messages.length - 1])
    if (lastMsg && lastMsg._id !== messages[messages.length - 1]._id) {
      setLastMsg(messages[messages.length - 1])
    }
  }, [lastMsg, messages])

  // 3 来了新消息的跳转
  // 新消息气泡
  const [showPop, setShowPop] = useState(false)
  // 点击气泡
  const clickPop = () => {
    gotoBottom()
    setShowPop(false)
  }
  useEffect(() => {
    if (!lastMsg) return
    if (lastMsg.fromId === userInfo._id) {
      gotoBottom()
      return
    }
    if (lastMsg.fromId === friendInfo._id && atBottom) {
      gotoBottom()
    } else {
      setShowPop(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMsg])

  /* ****************************************************************
   *                            上拉加载                             *
   ******************************************************************/

  const statusRecord: Record<PullStatus, string> = {
    pulling: '用力拉',
    canRelease: '松开吧',
    refreshing: '加载中...',
    complete: '加载完成',
  }

  return (
    <>
      <div className={styles.chatContainer}>
        <NavBar onBack={() => navigate(-1)}>{friendInfo.nickname}</NavBar>
        <main ref={mainRef} className={styles.chatBody}>
          <PullToRefresh
            onRefresh={async () => {
              await loadMore()
            }}
            renderText={(status) => <div>{statusRecord[status]}</div>}
          >
            {(() => {
              const firstUnReadedMessageIndex = messages.findIndex(
                (message) =>
                  message.fromId.toString() === friendInfo._id &&
                  !message.readed
              )
              return messages.map((msg, index) => (
                <div key={msg._id}>
                  {firstUnReadedMessageIndex === index && (
                    <Divider>未读</Divider>
                  )}
                  <MessageComponent
                    id={msg._id!}
                    content={msg.content}
                    contentType={msg.contentType}
                    from={
                      msg.fromId === userInfo._id ? FromType.Me : FromType.You
                    }
                    date={msg.createdAt!}
                    onDelete={() => deleteMessage(index)}
                  />
                </div>
              ))
            })()}
          </PullToRefresh>
        </main>
        <footer className={styles.chatFooter}>
          <input
            placeholder="none"
            className={styles.fileInput}
            ref={fileRef}
            type="file"
            onChange={sendImage}
          />
          <div className={styles.iconImg} onClick={selectImg}>
            <IconImg width="20" height="20" />
          </div>
          <Input
            ref={inputRef}
            autoFocus
            clearable
            className={styles.input}
            placeholder={'开始写私信'}
            onEnterPress={sendMessage}
          />
          <Popover
            content={<span onClick={clickPop}>新消息</span>}
            placement="top"
            mode="dark"
            visible={showPop}
          >
            <Button
              className={styles.btn}
              shape="rounded"
              color="primary"
              fill="solid"
              size="small"
              onClick={sendMessage}
            >
              发送
            </Button>
          </Popover>
        </footer>
      </div>
      {imgVisible ? <ShowPic /> : null}
    </>
  )
}
