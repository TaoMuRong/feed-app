import Axios from './request'
import { ApiResp, IPost, IUser } from '../libs/types'

export async function wxlogin() {
  const { data } = await Axios.get<ApiResp<{ wxUri: string }>>('/user/wxlogin')
  return data
}

export async function redirectLogin() {
  const { data } = await Axios.get<ApiResp<{ code: string }>>(
    '/user/redirectlogin'
  )
  return data
}

export async function wxloginTest() {
  const { data } = await Axios.get<ApiResp<{ appId: string; uri: string }>>(
    '/user/wxlogintest'
  )
  return data
}

export async function login(code: string) {
  const { data } = await Axios.get<ApiResp<IUser>>(`/user/login?code=${code}`)
  return data
}

export async function register(userInfo: IUser) {
  const { data } = await Axios.post<ApiResp<{ userInfo: IUser }>>(
    '/user/register',
    { userInfo }
  )
  return data
}

export async function getInfo(token: string) {
  const { data } = await Axios.get<ApiResp<{ userInfo: IUser }>>('/user/info', {
    headers: {
      Cookie: `token=${token}`,
    },
  })
  return data
}

export async function getUserInfo(userId: string, token: string) {
  const { data } = await Axios.get<ApiResp<{ userInfo: IUser }>>('/user/info', {
    params: {
      userId,
    },
    headers: {
      Cookie: `token=${token}`,
    },
  })
  return data
}

export async function changeUserInfo(userInfo: IUser, token: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>(
    '/user/chinfo',
    {
      userInfo,
    },
    {
      headers: {
        Cookie: `token=${token}`,
      },
    }
  )
  return data
}

export async function logout(token: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>(
    '/user/logout',
    {},
    {
      headers: {
        Cookie: `token=${token}`,
      },
    }
  )
  return data
}

export async function userPosts(
  userId: string,
  hasImage: boolean,
  token: string
) {
  const { data } = await Axios.get<ApiResp<IPost[]>>('/user/posts', {
    params: { userId, hasImage },
    headers: {
      Cookie: `token=${token}`,
    },
  })
  return data
}

export async function userLikes(userId: string, token: string) {
  const { data } = await Axios.get<ApiResp<IPost[]>>('/user/likes', {
    params: {
      userId,
    },
    headers: {
      Cookie: `token=${token}`,
    },
  })
  return data
}
