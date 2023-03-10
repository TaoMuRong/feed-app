import { Divider, Empty, NavBar, PullToRefresh } from 'antd-mobile'
import { useNavigate, useParams } from 'react-router-dom'

import { ReactComponent as IconBack } from '../../../../assets/imgs/back.svg'
import useThread from '../../../../hooks/useThread'
import IThread from '../../../../components/IThread'
import ThreadDetail from '../../../../components/ThreadDetail'
import AddPost from '../../../../components/AddPost'
import PostPopup from '../../../../components/PostPopup'
import Posts from '../../../../components/Posts'
import styles from './style.module.scss'
import ResponseThread from '../../../../components/ResponseThread'
import { useContext } from 'react'
import { context } from '../../../../hooks/store'
import ShowPic from '../../../../components/ShowPic'

export default function Thread() {
  const { _id } = useParams()
  const navigate = useNavigate()
  const { imgVisible } = useContext(context)
  const {
    thread,
    comments,
    relativePost,
    listRelativePost,
    commentPost,
    listComment,
    repostPost,
    likePost,
    cancelLikePost,
    commentRelativePost,
    repostRelativePost,
    likeRelativePost,
    cancelLikeRelativePost,
    addPost,
    likePosts,
    commentPosts,
    repostPosts,
    cancelLikePosts,
    deletePost,
  } = useThread(_id as string)

  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        <NavBar
          onBack={() => navigate(-1)}
          backArrow={<IconBack />}
          style={{ fontWeight: '700', fontSize: '16' }}
        >
          主题帖
        </NavBar>
      </div>
      <Divider />
      {thread.post.type !== 2 ? (
        <>
          <IThread thread={thread} />
          <ThreadDetail
            thread={thread}
            deletePost={deletePost}
            repostPost={repostPost}
            commentPost={commentPost}
            likePosts={likePost}
            cancelLikePosts={cancelLikePost}
          />
          <PullToRefresh onRefresh={() => listComment(_id as string)}>
            {comments.length === 0 ? (
              <Empty description="还没有评论，快来抢沙发吧" />
            ) : (
              comments.map((comment) => (
                <Posts
                  key={comment.post._id}
                  deletePost={deletePost}
                  post={comment}
                  repostPost={repostPosts}
                  commentPost={commentPosts}
                  likePosts={likePosts}
                  cancelLikePosts={cancelLikePosts}
                  type={1}
                  relativeNickname={thread.user.account}
                />
              ))
            )}
          </PullToRefresh>
        </>
      ) : (
        <>
          <ResponseThread
            thread={thread}
            deletePost={deletePost}
            relativePost={relativePost}
            listRelativePost={listRelativePost}
            commentRelativePost={commentRelativePost}
            repostRelativePost={repostRelativePost}
            likeRelativePost={likeRelativePost}
            cancelLikeRelativePost={cancelLikeRelativePost}
          />
          <ThreadDetail
            thread={thread}
            deletePost={deletePost}
            repostPost={repostPost}
            commentPost={commentPost}
            likePosts={likePost}
            cancelLikePosts={cancelLikePost}
          />
          <PullToRefresh onRefresh={() => listComment(_id as string)}>
            {comments.length === 0 ? (
              <Empty description="还没有评论，快来抢沙发吧" />
            ) : (
              comments.map((comment) => (
                <Posts
                  key={comment.post._id}
                  deletePost={deletePost}
                  post={comment}
                  repostPost={repostPosts}
                  commentPost={commentPosts}
                  likePosts={likePosts}
                  cancelLikePosts={cancelLikePosts}
                  type={1}
                  relativeNickname={thread.user.account}
                />
              ))
            )}
          </PullToRefresh>
        </>
      )}
      {imgVisible ? <ShowPic /> : null}
      <AddPost />
      <PostPopup addPost={addPost} />
    </div>
  )
}
