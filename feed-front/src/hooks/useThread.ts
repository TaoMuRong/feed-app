import { useState, useCallback, useEffect, useContext } from 'react'
import { EmptyPost, IPost } from '../libs/types'
import * as postApi from '../api/posts'
import { context } from './store'

export default function useThread(postId: string) {
  const [thread, setThread] = useState<IPost>(EmptyPost)
  const [relativePost, setRelativePost] = useState<IPost>(EmptyPost)
  const [comments, setComments] = useState<IPost[]>([])
  const [error, setError] = useState('')
  const { userInfo } = useContext(context)

  const listThread = useCallback(async (postId: string) => {
    try {
      setError('')
      const { code, message, data } = await postApi.getPost(postId)
      if (code === 0) {
        setThread(data)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [])

  useEffect(() => {
    listThread(postId)
  }, [listThread, postId])

  const listRelativePost = useCallback(async (relativeId: string) => {
    try {
      setError('')
      const { code, message, data } = await postApi.getPost(relativeId)
      if (code === 0) {
        setRelativePost(data)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [])

  const listComment = useCallback(async (postId: string) => {
    try {
      setError('')
      const { code, message, data } = await postApi.listComments(postId)
      if (code === 0) {
        setComments(data)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [])

  useEffect(() => {
    listComment(postId)
  }, [listComment, postId])

  const commentRelativePost = useCallback(
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
          relativePost.post.comments++
          setRelativePost({ ...relativePost })
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
        throw error
      }
    },
    [relativePost]
  )

  const repostRelativePost = useCallback(
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
          relativePost.post.reposts++
          setRelativePost({ ...relativePost })
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
        throw error
      }
    },
    [relativePost]
  )

  const likeRelativePost = useCallback(
    async (postId: string) => {
      try {
        setError('')
        const { code, message } = await postApi.likePosts(postId)
        if (code === 0) {
          relativePost.post.likes++
          relativePost.status.isLiked = true
          setRelativePost({ ...relativePost })
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [relativePost]
  )

  const cancelLikeRelativePost = useCallback(
    async (postId: string) => {
      try {
        setError('')
        const { code, message } = await postApi.cancelLikePosts(postId)
        if (code === 0) {
          relativePost.post.likes--
          relativePost.status.isLiked = false

          setThread({ ...relativePost })
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [relativePost]
  )
  const commentPost = useCallback(
    async (content: string, images: string[], relativeId: string) => {
      try {
        const imageList = [...images]
        setError('')
        const { code, message, data } = await postApi.addPosts(
          2,
          content,
          images,
          relativeId
        )
        if (code === 0) {
          comments.forEach((item) => {
            if (item.post._id === relativeId) item.post.comments++
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
              type: 2,
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
          comments.push(newPost)
          setComments([...comments])
          thread.post.comments++
          setThread({ ...thread })
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
        throw error
      }
    },
    [
      comments,
      thread,
      userInfo._id,
      userInfo.account,
      userInfo.avatar,
      userInfo.nickname,
    ]
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
          thread.post.reposts++
          setThread({ ...thread })
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
        throw error
      }
    },
    [thread]
  )

  const likePost = useCallback(
    async (postId: string) => {
      try {
        setError('')
        const { code, message } = await postApi.likePosts(postId)
        if (code === 0) {
          thread.post.likes++
          thread.status.isLiked = true

          setThread({ ...thread })
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [thread]
  )

  const cancelLikePost = useCallback(
    async (postId: string) => {
      try {
        setError('')
        const { code, message } = await postApi.cancelLikePosts(postId)
        if (code === 0) {
          thread.post.likes--
          thread.status.isLiked = false

          setThread({ ...thread })
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [thread]
  )

  const commentPosts = useCallback(
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
          comments.forEach((item) => {
            if (item.post._id === relativeId) item.post.comments++
          })
          setComments([...comments])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
        throw error
      }
    },
    [comments]
  )

  const repostPosts = useCallback(
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
          comments.forEach((item) => {
            if (item.post._id === relativeId) item.post.reposts++
          })
          setComments([...comments])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
        throw error
      }
    },
    [comments]
  )

  const likePosts = useCallback(
    async (postId: string) => {
      try {
        setError('')
        const { code, message } = await postApi.likePosts(postId)
        if (code === 0) {
          comments.forEach((item) => {
            if (item.post._id === postId) {
              item.post.likes++
              item.status.isLiked = true
            }
          })
          setComments([...comments])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [comments]
  )

  const cancelLikePosts = useCallback(
    async (postId: string) => {
      try {
        setError('')
        const { code, message } = await postApi.cancelLikePosts(postId)
        if (code === 0) {
          comments.forEach((item) => {
            if (item.post._id === postId) {
              item.post.likes--
              item.status.isLiked = false
            }
          })
          setComments([...comments])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [comments]
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
          comments.forEach((item, index) => {
            if (item.post._id === postId) delIndex = index
          })
          comments.splice(delIndex, 1)
          setComments([...comments])
        } else {
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
      }
    },
    [comments]
  )

  return {
    thread,
    comments,
    error,
    relativePost,
    listThread,
    listComment,
    listRelativePost,
    commentPost,
    repostPost,
    likePost,
    cancelLikePost,
    commentRelativePost,
    repostRelativePost,
    likeRelativePost,
    cancelLikeRelativePost,
    addPost,
    deletePost,
    likePosts,
    commentPosts,
    repostPosts,
    cancelLikePosts,
  }
}
