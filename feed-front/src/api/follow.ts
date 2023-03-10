import Axios from './request'
import { ApiResp, ISearchUser } from '../libs/types'

export async function followUser(followedId: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>('/user/follow', {
    followedId,
  })
  return data
}

export async function cancelFollowUser(followedId: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>(
    '/user/cancelFollow',
    {
      followedId,
    }
  )
  return data
}

export async function followList(userId: string) {
  const { data } = await Axios.get<ApiResp<ISearchUser[]>>('/user/followList', {
    params: {
      userId,
    },
  })
  return data
}

export async function fansList(userId: string) {
  const { data } = await Axios.get<ApiResp<ISearchUser[]>>('/user/fansList', {
    params: {
      userId,
    },
  })
  return data
}
