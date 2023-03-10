import { useContext, useEffect, useState } from 'react'
import styles from './style.module.scss'
import { Avatar } from 'antd-mobile'
import { ReactComponent as IconRedLike } from '../../assets/imgs/redLike.svg'
import { ReactComponent as IconComment } from '../../assets/imgs/comment.svg'
import { ReactComponent as IconSend } from '../../assets/imgs/send.svg'
import { ReactComponent as IconLike } from '../../assets/imgs/like.svg'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import { IPost } from '../../libs/types'
import ResponsePopup from '../ResponsePopup'
import RepostPopup from '../RepostPopup'
import { context } from '../../hooks/store'
import { useNavigate } from 'react-router-dom'
interface IProps {
  thread: IPost
  relativePost: IPost
  listRelativePost: (relativeId: string) => Promise<void>
  commentRelativePost: (
    content: string,
    images: string[],
    relativeId: string
  ) => Promise<void>
  repostRelativePost: (
    content: string,
    images: string[],
    relativeId: string
  ) => Promise<void>
  likeRelativePost: (postId: string) => Promise<void>
  cancelLikeRelativePost: (postId: string) => Promise<void>
  deletePost: (postId: string) => Promise<void>
}

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')
function computedTime(time: number) {
  if (dayjs(time).isBefore(dayjs().subtract(14, 'day')))
    return dayjs().format('YYYY-MM-DD')
  else return dayjs(time).fromNow()
}

export default function ResponseThread({
  thread,
  relativePost,
  listRelativePost,
  commentRelativePost,
  repostRelativePost,
  likeRelativePost,
  deletePost,
  cancelLikeRelativePost,
}: IProps) {
  useEffect(() => {
    listRelativePost(thread.post.relativeId as string)
  }, [listRelativePost, thread.post.relativeId])
  const createTime = computedTime(relativePost.post.createdAt)
  const { setImgUrl, setImgVisible } = useContext(context)
  const [responsePopup, setResponsePopup] = useState(false)
  const [repostPopup, setRepostPopup] = useState(false)
  const navigate = useNavigate()
  async function addLike() {
    likeRelativePost(relativePost.post._id)
  }

  async function cancelLike() {
    cancelLikeRelativePost(relativePost.post._id)
  }

  return (
    <>
      <div className={styles.PostsWrap}>
        <div className={styles.avatar}>
          <Avatar
            src={
              relativePost.user.avatar.startsWith('https://thirdwx.qlogo.cn')
                ? relativePost.user.avatar
                : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${relativePost.user.avatar}`
            }
            style={{ '--border-radius': '25px' }}
            onClick={() =>
              navigate('/home/userCenter/' + relativePost.user._id)
            }
          />
          <div className={styles.line}></div>
        </div>
        <div className={styles.contentBox}>
          <div className={styles.contentTitle}>
            <div className={styles.nickName}>{relativePost.user.nickname}</div>
            <div
              className={styles.userName}
            >{`${relativePost.user.account} · ${createTime}`}</div>
          </div>
          <div className={styles.content}>
            {relativePost.post._id === '' ? (
              <div className={styles.deleted}>帖子已删除</div>
            ) : (
              <span className={styles.word}>{relativePost.post.content}</span>
            )}

            {/* 遍历 */}
            {relativePost.post.images.length > 1 ? (
              <div className={styles.imgBox}>
                {relativePost.post.images.map((item) => {
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
              relativePost.post.images.map((item) => {
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
          <div className={styles.footer}>
            <div className={styles.footerItem}>
              <IconComment onClick={() => setResponsePopup(true)} />
              <span className={styles.detail}>
                {relativePost.post.comments}
              </span>
            </div>
            <div className={styles.footerItem}>
              <IconSend onClick={() => setRepostPopup(true)} />
              <span className={styles.detail}>{relativePost.post.reposts}</span>
            </div>
            <div className={styles.footerItem}>
              {relativePost.status.isLiked ? (
                <IconRedLike onClick={cancelLike} />
              ) : (
                <IconLike onClick={addLike} />
              )}
              <span className={styles.detail}>{relativePost.post.likes}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.responseWrap}>
        <div className={styles.responseAvatar}>
          <Avatar
            src={
              thread.user.avatar.startsWith('https://thirdwx.qlogo.cn')
                ? thread.user.avatar
                : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${thread.user.avatar}`
            }
            style={{ '--border-radius': '25px' }}
            onClick={() => navigate('/home/userCenter/' + thread.user._id)}
          />
          <div className={styles.responseContentTitle}>
            <div className={styles.responseNickName}>
              {thread.user.nickname}
            </div>
            <div className={styles.responseUserName}>{thread.user.account}</div>
          </div>
        </div>
        <div className={styles.responseContent}>
          <div className={styles.responseAuthor}>
            回复{' '}
            <span className={styles.author}>{relativePost.user.account}</span>
          </div>
          <div className={styles.responseText}>{thread.post.content}</div>
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
      <ResponsePopup
        post={relativePost}
        responsePopup={responsePopup}
        setResponsePopup={setResponsePopup}
        commentPost={commentRelativePost}
      />
      <RepostPopup
        post={relativePost}
        deletePost={deletePost}
        repostPopup={repostPopup}
        setRepostPopup={setRepostPopup}
        commentPost={commentRelativePost}
        repostPost={repostRelativePost}
        likePosts={likeRelativePost}
        cancelLikePosts={cancelLikeRelativePost}
      />
    </>
  )
}
