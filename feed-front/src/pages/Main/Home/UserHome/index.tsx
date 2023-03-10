import {
  Avatar,
  Empty,
  InfiniteScroll,
  Popup,
  PullToRefresh,
  Toast,
} from 'antd-mobile'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AddPost from '../../../../components/AddPost'
import PostPopup from '../../../../components/PostPopup'
import Posts from '../../../../components/Posts'
import { context } from '../../../../hooks/store'
import styles from './style.module.scss'
import { ReactComponent as IconLogo } from '../../../../assets/imgs/logo.svg'
import { ReactComponent as IconPoint } from '../../../../assets/imgs/point.svg'
import UserPopup from '../../../../components/UserPopup'
import { ReactComponent as IconNotice } from '../../../../assets/imgs/notice.svg'
import usePosts from '../../../../hooks/usePosts'
import RepostPosts from '../../../../components/RepostPosts'
import ShowPic from '../../../../components/ShowPic'

export default function UserHome() {
  const { userInfo, imgVisible, badgeShow } = useContext(context)
  const [leftVisible, setLeftVisible] = useState(false)
  const navigate = useNavigate()
  const {
    posts,
    error,
    hasMore,
    listPosts,
    loadMore,
    commentPost,
    repostPost,
    likePosts,
    addPost,
    cancelLikePosts,
    deletePost,
  } = usePosts()

  useEffect(() => {
    if (error !== '') {
      Toast.show({
        icon: 'fail',
        content: error,
      })
    }
  })

  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        <Avatar
          src={
            userInfo.avatar.startsWith('https://thirdwx.qlogo.cn')
              ? userInfo.avatar
              : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${userInfo.avatar}`
          }
          className={styles.avatar}
          onClick={() => setLeftVisible(true)}
        />
        <IconLogo className={styles.logo} />
        <div>
          <IconNotice
            className={styles.logo}
            onClick={() => navigate('/notice')}
          />
          {badgeShow ? <IconPoint className={styles.redPoint} /> : null}
        </div>
      </div>
      <PullToRefresh onRefresh={listPosts}>
        {posts.length === 0 ? (
          <Empty description="暂无数据"></Empty>
        ) : (
          <>
            {posts.map((item) =>
              item.post.type === 1 ? (
                <Posts
                  post={item}
                  key={item.post._id}
                  type={item.post.type}
                  commentPost={commentPost}
                  repostPost={repostPost}
                  likePosts={likePosts}
                  cancelLikePosts={cancelLikePosts}
                  deletePost={deletePost}
                />
              ) : (
                <RepostPosts
                  post={item}
                  key={item.post._id}
                  commentPost={commentPost}
                  repostPost={repostPost}
                  likePosts={likePosts}
                  cancelLikePosts={cancelLikePosts}
                  deletePost={deletePost}
                />
              )
            )}
            <InfiniteScroll
              hasMore={hasMore}
              loadMore={loadMore}
              threshold={20}
            />
          </>
        )}
      </PullToRefresh>
      {imgVisible ? <ShowPic /> : null}
      <AddPost />
      <PostPopup addPost={addPost} />
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
