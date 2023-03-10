import { useState, useEffect, useCallback, useContext } from 'react'
import { EmptyRelativePost, IPost } from '../libs/types'
import * as postApi from '../api/posts'
import { context } from './store'

export default function usePosts() {
  const [posts, setPosts] = useState<IPost[]>([])
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const { userInfo } = useContext(context)

  const listPosts = useCallback(async () => {
    try {
      setError('')
      const { code, message, data } = await postApi.listPosts()
      if (code === 0) {
        setPosts(data)
        if (data.length === 10) setHasMore(true)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [])

  const loadMore = useCallback(async () => {
    try {
      setError('')
      const { code, message, data } = await postApi.listPosts(
        posts[posts.length - 1].post._id
      )
      if (code === 0) {
        if (data.length === 0) setHasMore(false)
        setPosts(posts.concat(data))
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [posts])

  const commentPost = useCallback(
    async (content: string, images: string[], relativeId: string) => {
      try {
        setError('')
        const { code, message } = await postApi.addPosts(
          2,
          content,
          images,
          relativeId
        )
        if (code === 0) {
          posts.forEach((item) => {
            if (item.post._id === relativeId) item.post.comments++
          })
          setPosts([...posts])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
        throw error
      }
    },
    [posts]
  )

  const repostPost = useCallback(
    async (
      content: string,
      images: string[],
      relativeId: string,
      relativePost?: IPost
    ) => {
      try {
        const imageList = [...images]
        setError('')
        const { code, message, data } = await postApi.addPosts(
          3,
          content,
          images,
          relativeId
        )
        if (code === 0) {
          posts.forEach((item) => {
            if (item.post._id === relativeId) item.post.reposts++
          })
          const newPost = {
            user: {
              _id: userInfo._id,
              avatar: userInfo.avatar,
              nickname: userInfo.nickname,
              account: userInfo.account,
            },
            post: {
              _id: data.postId,
              type: 3,
              relativeId: relativeId,
              createdAt: Date.now(),
              content: content,
              images: imageList,
              reposts: 0,
              comments: 0,
              likes: 0,
            },
            status: {
              isLiked: false,
              isReposted: false,
              isCommented: false,
            },
            relativePost: relativePost,
          } as IPost
          posts.unshift(newPost)
          setPosts([...posts])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
        throw error
      }
    },
    [posts, userInfo._id, userInfo.account, userInfo.avatar, userInfo.nickname]
  )

  const addPost = useCallback(
    async (content: string, images: string[]) => {
      try {
        const imageList = [...images]
        setError('')
        const { code, message, data } = await postApi.addPosts(
          1,
          content,
          images
        )
        if (code === 0) {
          const newPost = {
            user: {
              _id: userInfo._id,
              avatar: userInfo.avatar,
              nickname: userInfo.nickname,
              account: userInfo.account,
            },
            post: {
              _id: data.postId,
              type: 1,
              relativeId: null,
              createdAt: Date.now(),
              content: content,
              images: imageList,
              reposts: 0,
              comments: 0,
              likes: 0,
            },
            status: {
              isLiked: false,
              isReposted: false,
              isCommented: false,
            },
          } as IPost
          posts.unshift(newPost)
          setPosts([...posts])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
        throw error
      }
    },
    [posts, userInfo._id, userInfo.account, userInfo.avatar, userInfo.nickname]
  )

  const likePosts = useCallback(
    async (postId: string) => {
      try {
        setError('')
        const { code, message } = await postApi.likePosts(postId)
        if (code === 0) {
          posts.forEach((item) => {
            if (item.post._id === postId) {
              item.post.likes++
              item.status.isLiked = true
            }
          })
          setPosts([...posts])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [posts]
  )

  const cancelLikePosts = useCallback(
    async (postId: string) => {
      try {
        setError('')
        const { code, message } = await postApi.cancelLikePosts(postId)
        if (code === 0) {
          posts.forEach((item) => {
            if (item.post._id === postId) {
              item.post.likes--
              item.status.isLiked = false
            }
          })
          setPosts([...posts])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [posts]
  )

  const deletePost = useCallback(
    async (postId: string) => {
      try {
        setError('')
        const { code, message } = await postApi.deletePosts(postId)
        if (code === 0) {
          let delIndex = -1
          posts.forEach((item, index) => {
            if (item.post._id === postId) delIndex = index
            if (item.relativePost.post._id === postId) {
              item.relativePost = EmptyRelativePost
            }
            if (item.relativePost.post.relativeId === postId)
              item.relativePost = EmptyRelativePost
          })
          posts.splice(delIndex, 1)
          setPosts([...posts])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [posts]
  )

  useEffect(() => {
    listPosts()
  }, [listPosts])

  return {
    posts,
    error,
    hasMore,
    listPosts,
    loadMore,
    commentPost,
    repostPost,
    likePosts,
    addPost,
    deletePost,
    cancelLikePosts,
  }
}
