import { useState, useCallback, useEffect } from 'react'
import { EmptyUser, IPost, IUser } from '../libs/types'
import * as postApi from '../api/posts'
import * as followApi from '../api/follow'
import * as userApi from '../api/user'

export default function useUserCenter(userId: string) {
  const [posts, setPosts] = useState<IPost[]>([])
  const [userInfo, setUserInfo] = useState<IUser>(EmptyUser)
  const [error, setError] = useState('')

  const listPosts = useCallback(async (userId: string, hasImage: boolean) => {
    try {
      setError('')
      const { code, message, data } = await userApi.userPosts(userId, hasImage)
      if (code === 0) {
        setPosts(data)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [])

  useEffect(() => {
    listPosts(userId, false)
  }, [listPosts, userId])

  const listLikes = useCallback(async (userId: string) => {
    try {
      setError('')
      const { code, message, data } = await userApi.userLikes(userId)
      if (code === 0) {
        setPosts(data)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [])

  const getUserInfo = useCallback(async (userId: string) => {
    try {
      setError('')
      const { code, message, data } = await userApi.getUserInfo(userId)
      if (code === 0) {
        setUserInfo(data.userInfo)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [])

  useEffect(() => {
    getUserInfo(userId)
  }, [getUserInfo, userId])

  const followUser = useCallback(
    async (followedId: string) => {
      try {
        setError('')
        const { code, message } = await followApi.followUser(followedId)
        if (code === 0) {
          userInfo.status!.isFollowed = true
          setUserInfo({ ...userInfo })
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [userInfo]
  )

  const cancelFollowUser = useCallback(
    async (followedId: string) => {
      try {
        setError('')
        const { code, message } = await followApi.cancelFollowUser(followedId)
        if (code === 0) {
          userInfo.status!.isFollowed = false
          setUserInfo({ ...userInfo })
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [userInfo]
  )

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
    async (content: string, images: string[], relativeId: string) => {
      try {
        setError('')
        const { code, message } = await postApi.addPosts(
          3,
          content,
          images,
          relativeId
        )
        if (code === 0) {
          posts.forEach((item) => {
            if (item.post._id === relativeId) item.post.reposts++
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

  const addPost = useCallback(async (content: string, images: string[]) => {
    try {
      setError('')
      const { code, message } = await postApi.addPosts(1, content, images)
      if (code !== 0) {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [])

  const deletePost = useCallback(
    async (postId: string) => {
      try {
        setError('')
        const { code, message } = await postApi.deletePosts(postId)
        if (code === 0) {
          let delIndex = -1
          posts.forEach((item, index) => {
            if (item.post._id === postId) delIndex = index
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

  return {
    posts,
    userInfo,
    error,
    getUserInfo,
    listPosts,
    listLikes,
    commentPost,
    repostPost,
    likePosts,
    cancelLikePosts,
    addPost,
    deletePost,
    followUser,
    cancelFollowUser,
  }
}
