import { useContext, useState } from 'react'
import styles from './style.module.scss'
import { Avatar } from 'antd-mobile'
import { ReactComponent as IconComment } from '../../assets/imgs/comment.svg'
import { ReactComponent as IconSend } from '../../assets/imgs/send.svg'
import { ReactComponent as IconLike } from '../../assets/imgs/like.svg'
import { ReactComponent as IconRedLike } from '../../assets/imgs/redLike.svg'
import { ReactComponent as IconEllipsis } from '../../assets/imgs/ellipsis.svg'
import Posts from '../Posts'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import { IPost } from '../../libs/types'
import ResponsePopup from '../ResponsePopup'
import RepostPopup from '../RepostPopup'
import { useNavigate } from 'react-router-dom'
import { context } from '../../hooks/store'
import DeletePost from '../DeletePopup'

interface IProps {
  post: IPost
  commentPost: (
    content: string,
    images: string[],
    relativeId: string
  ) => Promise<void>
  repostPost: (
    content: string,
    images: string[],
    relativeId: string,
    relativePost?: IPost | undefined
  ) => Promise<void>
  likePosts: (postId: string) => Promise<void>
  cancelLikePosts: (postId: string) => Promise<void>
  deletePost: (postId: string) => Promise<void>
}
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')
function computedTime(time: number) {
  if (dayjs(time).isBefore(dayjs().subtract(14, 'day')))
    return dayjs().format('YYYY-MM-DD')
  else return dayjs(time).fromNow()
}
export default function RepostPosts({
  post,
  commentPost,
  repostPost,
  likePosts,
  deletePost,
  cancelLikePosts,
}: IProps) {
  const { userInfo, setImgUrl, setImgVisible } = useContext(context)
  const [repostPopup, setRepostPopup] = useState(false)
  const [responsePopup, setResponsePopup] = useState(false)
  const [deletePopup, setDeletePopup] = useState(false)
  const createTime = computedTime(post.post.createdAt)

  const navigate = useNavigate()

  async function addLike() {
    likePosts(post.post._id)
  }

  async function cancelLike() {
    cancelLikePosts(post.post._id)
  }
  return (
    <>
      <div className={styles.PostsWrap}>
        <div className={styles.avatar}>
          <Avatar
            src={
              post.user.avatar.startsWith('https://thirdwx.qlogo.cn')
                ? post.user.avatar
                : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${post.user.avatar}`
            }
            style={{ '--border-radius': '25px' }}
            onClick={() => navigate('/home/userCenter/' + post.user._id)}
          />
        </div>
        <div className={styles.contentBox}>
          <div className={styles.contentTitle}>
            <div className={styles.contentTitleLeft}>
              <div className={styles.nickName}>{post.user.nickname}</div>
              <div
                className={styles.userName}
              >{`${post.user.account} · ${createTime}`}</div>
            </div>
            {userInfo._id === post.user._id ? (
              <IconEllipsis
                className={styles.ellipsis}
                onClick={() => setDeletePopup(true)}
              />
            ) : null}
          </div>
          <div className={styles.content}>
            <span
              className={styles.word}
              onClick={() => navigate('/home/thread/' + post.post._id)}
            >
              {post.post.content}
            </span>
            {/* 遍历 */}
            {post.post.images.length > 1 ? (
              <div className={styles.imgBox}>
                {post.post.images.map((item) => {
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
              post.post.images.map((item) => {
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
            <div className={styles.responseWarp}>
              {post.post._id && !post.relativePost.user._id ? (
                <div className={styles.deleted}>帖子被删除</div>
              ) : (
                <Posts
                  deletePost={deletePost}
                  post={post.relativePost}
                  type={2}
                  commentPost={commentPost}
                  repostPost={repostPost}
                  likePosts={likePosts}
                  cancelLikePosts={cancelLikePosts}
                />
              )}
            </div>
          </div>
          <div className={styles.footer}>
            <div className={styles.footerItem}>
              <IconComment onClick={() => setResponsePopup(true)} />
              <span className={styles.detail}>{post.post.comments}</span>
            </div>
            <div className={styles.footerItem}>
              <IconSend onClick={() => setRepostPopup(true)} />
              <span className={styles.detail}>{post.post.reposts}</span>
            </div>
            <div className={styles.footerItem}>
              {post.status.isLiked ? (
                <IconRedLike onClick={cancelLike} />
              ) : (
                <IconLike onClick={addLike} />
              )}
              <span className={styles.detail}>{post.post.likes}</span>
            </div>
          </div>
        </div>
      </div>
      <ResponsePopup
        post={post}
        responsePopup={responsePopup}
        setResponsePopup={setResponsePopup}
        commentPost={commentPost}
      />
      <RepostPopup
        post={post}
        deletePost={deletePost}
        repostPopup={repostPopup}
        setRepostPopup={setRepostPopup}
        commentPost={commentPost}
        repostPost={repostPost}
        likePosts={likePosts}
        cancelLikePosts={cancelLikePosts}
      />
      <DeletePost
        post={post}
        deletePopup={deletePopup}
        setDeletePopup={setDeletePopup}
        deletePost={deletePost}
      />
    </>
  )
}
