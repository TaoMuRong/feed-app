import { useState, useCallback, useContext } from 'react'
import { IPost, ISearchUser } from '../libs/types'
import * as searchApi from '../api/search'
import * as postApi from '../api/posts'
import * as followApi from '../api/follow'
import { context } from './store'

export default function useSearch() {
  const [posts, setPosts] = useState<IPost[]>([])
  const [users, setUsers] = useState<ISearchUser[]>([])
  const [error, setError] = useState('')
  const { userInfo } = useContext(context)

  const searchPosts = useCallback(async (words: string, hasImage: boolean) => {
    try {
      setError('')
      const { code, message, data } = await searchApi.searchPosts(
        words,
        hasImage
      )
      if (code === 0) {
        setPosts(data)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [])

  const searchUsers = useCallback(async (words: string) => {
    try {
      setError('')
      const { code, message, data } = await searchApi.searchUsers(words)
      if (code === 0) {
        setUsers(data)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [])

  const followUser = useCallback(
    async (followedId: string) => {
      try {
        setError('')
        const { code, message } = await followApi.followUser(followedId)
        if (code === 0) {
          users.forEach((item) => {
            if (item._id === followedId) item.status.isFollowed = true
          })
          setUsers([...users])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [users]
  )

  const cancelFollowUser = useCallback(
    async (followedId: string) => {
      try {
        setError('')
        const { code, message } = await followApi.cancelFollowUser(followedId)
        if (code === 0) {
          users.forEach((item) => {
            if (item._id === followedId) item.status.isFollowed = false
          })
          setUsers([...users])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [users]
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
        const imageList = [...images]
        setError('')
        const { code, message, data } = await postApi.addPosts(
          3,
          content,
          images,
          relativeId
        )
        if (code === 0) {
          let words = ''
          posts.forEach((item) => {
            if (item.post._id === relativeId) {
              item.post.reposts++
              words = item.post.content
            }
          })
          if (words === content) {
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
            } as IPost
            posts.push(newPost)
          }

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
    users,
    error,
    searchUsers,
    searchPosts,
    commentPost,
    repostPost,
    likePosts,
    addPost,
    deletePost,
    followUser,
    cancelFollowUser,
    cancelLikePosts,
  }
}
