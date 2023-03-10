import Axios from './request'
import { ApiResp, ISearchUser } from '../libs/types'

export async function followUser(followedId: string, token: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>('/user/follow', {
    followedId,
  }, {
    headers: {
      Cookie: `token=${token}`,
    }
  })
  return data
}

export async function cancelFollowUser(followedId: string, token: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>(
    '/user/cancelFollow',
    {
      followedId,
    }, {
    headers: {
      Cookie: `token=${token}`,
    }
  }
  )
  return data
}

export async function followList(userId: string, token: string) {
  const { data } = await Axios.get<ApiResp<ISearchUser[]>>('/user/followList', {
    params: {
      userId,
    },
    headers: {
      Cookie: `token=${token}`,
    }
  })
  return data
}

export async function fansList(userId: string,token: string) {
  const { data } = await Axios.get<ApiResp<ISearchUser[]>>('/user/fansList', {
    params: {
      userId,
    },
    headers: {
      Cookie: `token=${token}`,
    }
  })
  return data
}
