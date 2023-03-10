import { useContext, useEffect, useState } from 'react'
import styles from './style.module.scss'
import {
  Avatar,
  Divider,
  Empty,
  NavBar,
  Popup,
  PullToRefresh,
  SwipeAction,
  Toast,
} from 'antd-mobile'
import AddPost from '../../../components/AddPost'
import PostPopup from '../../../components/PostPopup'
import { ReactComponent as IconRed } from '../../../assets/imgs/redPoint.svg'
import dayjs from 'dayjs'
import { useNotice } from '../../../hooks/useNotice'
import { INotice } from '../../../libs/types'
import usePosts from '../../../hooks/usePosts'
import { context } from '../../../hooks/store'
import UserPopup from '../../../components/UserPopup'
import { readNotice, rmNotice, unreadNotice } from '../../../api/notice'
import { useNavigate } from 'react-router-dom'

export default function Notice() {
  const navigate = useNavigate()

  const { userInfo, wsmessage, setBadgeShow } = useContext(context)

  const { notices, refresh } = useNotice(wsmessage)
  const { addPost } = usePosts()
  const setReaded = (notice: INotice) => {
    !notice.readed && readNotice(notice._id).then(() => (notice.readed = false))
    notice.readed && unreadNotice(notice._id).then(() => (notice.readed = true))
    refresh()
  }
  useEffect(() => {
    setBadgeShow(
      !notices.every((item) => {
        return item.readed
      })
    )
  }, [notices, setBadgeShow])
  const delNotice = (notice: INotice) => {
    rmNotice(notice._id).then(() => {
      Toast.show({
        icon: 'success',
        content: '删除成功',
      })
      refresh()
    })
  }
  const [leftVisible, setLeftVisible] = useState(false)

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
          通知
        </NavBar>
        <Divider />
      </div>

      <div className={styles.noticeList}>
        <PullToRefresh onRefresh={async () => refresh}>
          {notices.length === 0 ? (
            <Empty description="没有通知" />
          ) : (
            notices.map((notice) => (
              <div className={styles.notice} key={notice._id}>
                <SwipeAction
                  rightActions={[
                    {
                      key: 'mute',
                      text: notice.readed ? '设为未读' : '设为已读',
                      color: 'warning',
                      onClick: () => {
                        setReaded(notice)
                      },
                    },
                    {
                      key: 'delete',
                      text: '删除',
                      color: 'danger',
                      onClick: () => {
                        delNotice(notice)
                      },
                    },
                  ]}
                >
                  <div className={styles.noticeWarp}>
                    <div className={styles.avatar}>
                      <Avatar
                        src={
                          notice.from.avatar.startsWith(
                            'https://thirdwx.qlogo.cn'
                          )
                            ? notice.from.avatar
                            : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${notice.from.avatar}`
                        }
                        style={{ '--border-radius': '25px' }}
                        onClick={() =>
                          navigate('/home/userCenter/' + notice.from._id)
                        }
                      />
                    </div>
                    <div className={styles.noticeContent}>
                      <div className={styles.noticeTitle}>
                        <div
                          className={styles.nickName}
                          onClick={() =>
                            navigate('/home/userCenter/' + notice.from._id)
                          }
                        >
                          {notice.from.nickname}
                        </div>
                        <div className={styles.userWhat}>{notice.content}</div>
                      </div>
                      <div className={styles.time}>
                        {dayjs(notice.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                      </div>
                    </div>
                    {notice.readed || <IconRed className={styles.point} />}
                  </div>
                </SwipeAction>
                <AddPost />
                <PostPopup addPost={addPost} />
              </div>
            ))
          )}
        </PullToRefresh>
      </div>
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
