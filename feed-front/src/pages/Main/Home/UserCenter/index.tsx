import dayjs from 'dayjs'
import { useNavigate, useParams } from 'react-router-dom'
import { Image } from 'antd-mobile'

import styles from './style.module.scss'
import { ReactComponent as IconCalendar } from '../../../../assets/imgs/calendar.svg'
import { ReactComponent as IconBack } from '../../../../assets/imgs/back.svg'
import { ReactComponent as IconMessage } from '../../../../assets/imgs/message.svg'
import useUserCenter from '../../../../hooks/useUserCenter'
import { useContext, useRef } from 'react'
import { Empty, PullToRefresh, Tabs } from 'antd-mobile'
import Posts from '../../../../components/Posts'
import AddPost from '../../../../components/AddPost'
import PostPopup from '../../../../components/PostPopup'
import ShowPic from '../../../../components/ShowPic'
import { context } from '../../../../hooks/store'

export default function UserCenter() {
  const navigate = useNavigate()
  const { imgVisible } = useContext(context)
  const { _id } = useParams()
  const tabs = ['帖子', '照片', '喜欢']
  const postsRef = useRef<HTMLDivElement>(null)
  const checkedTab = useRef(tabs[0])
  const {
    userInfo,
    posts,
    listPosts,
    listLikes,
    commentPost,
    repostPost,
    likePosts,
    cancelLikePosts,
    addPost,
    followUser,
    cancelFollowUser,
    deletePost,
  } = useUserCenter(_id as string)

  const { userInfo: myInfo } = useContext(context)

  const checked = async (item: string) => {
    checkedTab.current = item
    if (item === '帖子') {
      await listPosts(userInfo._id, false)
      if (postsRef.current) postsRef.current!.scrollIntoView()
    } else if (item === '照片') {
      await listPosts(userInfo._id, true)
      if (postsRef.current) postsRef.current!.scrollIntoView()
    } else if (item === '喜欢') {
      await listLikes(userInfo._id)
      if (postsRef.current) postsRef.current!.scrollIntoView()
    }
  }

  const refresh = async () => {
    if (checkedTab.current === '帖子') {
      await listPosts(userInfo._id, false)
    } else if (checkedTab.current === '照片') {
      await listPosts(userInfo._id, true)
    } else if (checkedTab.current === '喜欢') {
      await listLikes(userInfo._id)
    }
  }

  const timeFormat = (time: number) => {
    return dayjs(time).format('YYYY/MM/DD')
  }

  return (
    <div className={styles.container}>
      <div className={styles.userInfo}>
        <div className={styles.imgs}>
          <img
            src={
              userInfo.background
                ? `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${userInfo.background}`
                : '/defaultImg.png'
            }
            alt="背景图片"
            className={styles.background}
          />
          <div className={styles.avatar}>
            <Image
              src={
                userInfo.avatar.startsWith('https://thirdwx.qlogo.cn') ||
                userInfo.avatar.startsWith('data:image/')
                  ? userInfo.avatar
                  : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${userInfo.avatar}`
              }
              width={54}
              height={54}
              fit="cover"
              style={{ borderRadius: 27 }}
            />
          </div>
          <div className={styles.follow}>
            {userInfo.status?.isFollowed ? (
              <button
                onClick={async () => cancelFollowUser(userInfo._id)}
                className={styles.button}
              >
                正在关注
              </button>
            ) : (
              <button
                onClick={async () => followUser(userInfo._id)}
                className={styles.focusbutton}
              >
                关注
              </button>
            )}
          </div>
          <div className={styles.back} onClick={() => navigate(-1)}>
            <IconBack />
          </div>
          <div
            className={styles.message}
            onClick={() =>
              _id === myInfo._id
                ? navigate('/message')
                : navigate('/chat/' + userInfo._id)
            }
          >
            <IconMessage />
          </div>
        </div>
        <div className={styles.text}>
          <div className={styles.nickname}>{userInfo.nickname}</div>
          <div className={styles.account}>
            <span>{userInfo.account}</span>
            <span className={styles.time}>
              <IconCalendar />
              {timeFormat(userInfo.createdAt)}加入
            </span>
          </div>
          <div className={styles.bio}>
            {userInfo.bio ? userInfo.bio : '这个人很懒，没有写自我介绍'}
          </div>
          <div
            className={styles.follow}
            onClick={() => navigate('/home/followList/' + userInfo._id)}
          >
            <span>
              <span className={styles.number}>
                {userInfo.follow.followings}
              </span>
              正在关注
            </span>
            <span>
              <span className={styles.number}>{userInfo.follow.followeds}</span>
              关注者
            </span>
          </div>
        </div>
      </div>
      <Tabs onChange={checked} className={styles.tabs} activeLineMode="full">
        {tabs.map((tab) => (
          <Tabs.Tab title={tab} key={tab} />
        ))}
      </Tabs>
      <div className={styles.content}>
        <PullToRefresh onRefresh={refresh}>
          {posts.length === 0 ? (
            <Empty description="该用户还未发帖" />
          ) : (
            <div ref={postsRef}>
              {posts.map((post) => (
                <Posts
                  post={post}
                  deletePost={deletePost}
                  type={1}
                  key={post.post._id}
                  commentPost={commentPost}
                  repostPost={repostPost}
                  likePosts={likePosts}
                  cancelLikePosts={cancelLikePosts}
                />
              ))}
            </div>
          )}
        </PullToRefresh>
      </div>
      {imgVisible ? <ShowPic /> : null}
      <AddPost />
      <PostPopup addPost={addPost} />
    </div>
  )
}
