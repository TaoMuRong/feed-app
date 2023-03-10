import { useContext, useEffect, useState } from 'react'
import styles from './style.module.scss'
import {
  Avatar,
  Divider,
  NavBar,
  Popup,
  SwipeAction,
  Empty,
  PullToRefresh,
} from 'antd-mobile'
import { context } from '../../../hooks/store'
import UserPopup from '../../../components/UserPopup'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useMessageList } from '../../../hooks/useMessageList'
import { deleteOneMessageList, readAll } from '../../../api/message'
import { IMsgInList } from '../../../libs/types'

export default function Message() {
  const { userInfo, wsmessage, setMessageBadge } = useContext(context)
  const { messagesInList, refresh } = useMessageList(wsmessage)
  const [leftVisible, setLeftVisible] = useState(false)
  const navigate = useNavigate()

  const [messages, setMessages] = useState<IMsgInList[]>([])

  useEffect(() => {
    if (messagesInList.length > 0) {
      setMessages(messagesInList)
    }
  }, [messagesInList])

  useEffect(() => {
    if (messages.length !== 0)
      setMessageBadge(
        messages.map((m) => m.message.unreadedNumber).reduce((a, b) => a + b)
      )
  }, [messages, setMessageBadge])

  const readOneMessageList = async (friendId: string) => {
    await readAll(friendId)
    const m = messages.find((m) => m.user._id === friendId)
    m!.message!.unreadedNumber = 0
    setMessages([...messages])
  }
  const deleteOneMessage = async (friendId: string) => {
    await deleteOneMessageList(friendId)
    const id = messages.findIndex((m) => m.user._id === friendId)
    messages.splice(id, 1)
    setMessages([...messages])
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        <NavBar
          backArrow={
            <Avatar
              src={
                userInfo.avatar.startsWith('https://thirdwx.qlogo.cn')
                  ? userInfo.avatar
                  : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${userInfo.avatar}`
              }
              className={styles.userAvatar}
              onClick={() => setLeftVisible(true)}
            />
          }
        >
          私信
        </NavBar>
        <Divider />
      </div>
      <PullToRefresh onRefresh={async () => refresh()}>
        {messagesInList.length === 0 ? (
          <Empty description="没有人私信你" />
        ) : (
          messagesInList.map((friend, index) => (
            <SwipeAction
              key={friend.user._id}
              rightActions={[
                {
                  key: 'mute',
                  text: '设为已读',
                  color: 'warning',
                  onClick: () => readOneMessageList(friend.user._id),
                },
                {
                  key: 'delete',
                  text: '删除',
                  color: 'danger',
                  onClick: () => deleteOneMessage(friend.user._id),
                },
              ]}
            >
              <div className={styles.messageWarp}>
                <div className={styles.avatar}>
                  <Avatar
                    src={
                      friend.user.avatar.startsWith('https://thirdwx.qlogo.cn')
                        ? friend.user.avatar
                        : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${friend.user.avatar}`
                    }
                    style={{
                      '--border-radius': '25px',
                      height: '50px',
                      width: '50px',
                    }}
                  />
                </div>
                <div
                  className={styles.messageContent}
                  onClick={() => {
                    navigate('/chat/' + friend.user._id)
                  }}
                >
                  <div className={styles.messageTitle}>
                    <div className={styles.nickName}>
                      {friend.user.nickname}
                    </div>
                    <div className={styles.sendTime}>
                      {dayjs(friend.message.createdAt).fromNow()}
                    </div>
                  </div>
                  <div className={styles.messageFooter}>
                    <div className={styles.message}>
                      {friend.message.lastMsg}
                    </div>
                    {friend.message.unreadedNumber === 0 ? (
                      <></>
                    ) : (
                      <span className={styles.redPoint}>
                        {friend.message.unreadedNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </SwipeAction>
          ))
        )}
      </PullToRefresh>
      <Popup
        visible={leftVisible}
        onMaskClick={() => {
          setLeftVisible(false)
        }}
        position="left"
        bodyStyle={{ minWidth: '70vw' }}
      >
        <UserPopup />
      </Popup>
    </div>
  )
}
