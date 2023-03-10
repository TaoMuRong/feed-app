import { useContext } from 'react'
import styles from './style.module.scss'
import { Avatar } from 'antd-mobile'
import { IPost } from '../../libs/types'
import { useNavigate } from 'react-router-dom'
import { context } from '../../hooks/store'
interface IProps {
  thread: IPost
}

export default function IThread({ thread }: IProps) {
  const navigate = useNavigate()
  const { setImgUrl, setImgVisible } = useContext(context)
  return (
    <div className={styles.PostsWrap}>
      <div className={styles.avatar}>
        <Avatar
          src={
            thread.user.avatar.startsWith('https://thirdwx.qlogo.cn')
              ? thread.user.avatar
              : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${thread.user.avatar}`
          }
          style={{ '--border-radius': '25px' }}
          onClick={() => navigate('/home/userCenter/' + thread.user._id)}
        />
        <div className={styles.contentTitle}>
          <div className={styles.nickName}>{thread.user.nickname}</div>
          <div className={styles.userName}>{thread.user.account}</div>
        </div>
      </div>
      <div className={styles.contentBox}>
        <div className={styles.content}>
          <span className={styles.word}>{thread.post.content}</span>
          {/* 遍历 */}
          {thread.post.images.length > 1 ? (
            <div className={styles.imgBox}>
              {thread.post.images.map((item) => {
                return (
                  <img
                    className={styles.img}
                    src={`https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${item}?x-oss-process=image/resize,w_200`}
                    alt=""
                    key={item}
                    onClick={() => {
                      setImgVisible(true)
                      setImgUrl(
                        `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${item}`
                      )
                    }}
                  />
                )
              })}
            </div>
          ) : (
            thread.post.images.map((item) => {
              return (
                <img
                  className={styles.imgSingle}
                  src={`https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${item}?x-oss-process=image/resize,w_200`}
                  alt=""
                  key={item}
                  onClick={() => {
                    setImgVisible(true)
                    setImgUrl(
                      `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${item}`
                    )
                  }}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
