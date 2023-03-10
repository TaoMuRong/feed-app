import { useState, useCallback, useEffect } from 'react'
import { ISearchUser } from '../libs/types'
import * as followApi from '../api/follow'

export default function useFollowList(userId: string) {
  const [users, setUsers] = useState<ISearchUser[]>([])
  const [error, setError] = useState('')

  const listFollows = useCallback(async (userId: string) => {
    try {
      setError('')
      const { code, message, data } = await followApi.followList(userId)
      if (code === 0) {
        setUsers(data)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [])

  const listFans = useCallback(async (userId: string) => {
    try {
      setError('')
      const { code, message, data } = await followApi.fansList(userId)
      if (code === 0) {
        setUsers(data)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [])

  useEffect(() => {
    listFans(userId)
  }, [listFans, userId])

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

  return {
    users,
    error,
    listFollows,
    listFans,
    followUser,
    cancelFollowUser,
  }
}
