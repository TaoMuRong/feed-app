import { useState } from 'react'
import styles from './style.module.scss'
import { ReactComponent as IconComment } from '../../assets/imgs/comment.svg'
import { ReactComponent as IconSend } from '../../assets/imgs/send.svg'
import { ReactComponent as IconLike } from '../../assets/imgs/like.svg'
import { ReactComponent as IconRedLike } from '../../assets/imgs/redLike.svg'
import { IPost } from '../../libs/types'
import dayjs from 'dayjs'
import ResponsePopup from '../ResponsePopup'
import RepostPopup from '../RepostPopup'

interface IProps {
  thread: IPost
  commentPost: (
    content: string,
    images: string[],
    relativeId: string
  ) => Promise<void>
  repostPost: (
    content: string,
    images: string[],
    relativeId: string
  ) => Promise<void>
  likePosts: (postId: string) => Promise<void>
  cancelLikePosts: (postId: string) => Promise<void>
  deletePost: (postId: string) => Promise<void>
}
export default function ThreadDetail({
  thread,
  commentPost,
  repostPost,
  likePosts,
  cancelLikePosts,
  deletePost,
}: IProps) {
  const [responsePopup, setResponsePopup] = useState(false)
  const [repostPopup, setRepostPopup] = useState(false)
  const timeFormat = (time: number) => {
    return dayjs(time).format('YYYY/MM/DD HH:mm')
  }
  const time = timeFormat(thread.post.createdAt)
  async function addLike() {
    likePosts(thread.post._id)
  }

  async function cancelLike() {
    cancelLikePosts(thread.post._id)
  }
  return (
    <>
      <div className={styles.detailWarp}>
        <div className={styles.timeBox}>
          <span className={styles.time}>{time}</span>
        </div>
        <div className={styles.count}>
          <span className={styles.report}>{thread.post.reposts}</span>转发
          <span className={styles.like}>{thread.post.likes}</span>喜欢
        </div>
        <div className={styles.action}>
          <IconComment onClick={() => setResponsePopup(true)} />
          <IconSend onClick={() => setRepostPopup(true)} />
          {thread.status.isLiked ? (
            <IconRedLike onClick={cancelLike} />
          ) : (
            <IconLike onClick={addLike} />
          )}
        </div>
      </div>
      <ResponsePopup
        post={thread}
        responsePopup={responsePopup}
        setResponsePopup={setResponsePopup}
        commentPost={commentPost}
      />
      <RepostPopup
        post={thread}
        deletePost={deletePost}
        repostPopup={repostPopup}
        setRepostPopup={setRepostPopup}
        commentPost={commentPost}
        repostPost={repostPost}
        likePosts={likePosts}
        cancelLikePosts={cancelLikePosts}
      />
    </>
  )
}
