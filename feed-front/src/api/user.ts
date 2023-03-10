import Axios from './request'
import { ApiResp, IPost, IUser } from '../libs/types'

export async function login(code: string) {
  const { data } = await Axios.get<ApiResp<IUser>>(`/user/login2?code=${code}`)
  return data
}

export async function wxlogin() {
  const { data } = await Axios.get<ApiResp<{ wxUri: string; id: string }>>(
    '/user/wxlogin'
  )
  return data
}

export async function wxlogin2() {
  const { data } = await Axios.get<ApiResp<{ wxUri: string; appId: string }>>(
    `/user/wxlogin2`
  )
  return data
}

export async function register(userInfo: IUser) {
  const { data } = await Axios.post<ApiResp<{ userInfo: IUser }>>(
    '/user/register',
    { userInfo }
  )
  return data
}

export async function getInfo() {
  const { data } = await Axios.get<ApiResp<{ userInfo: IUser }>>('/user/info')
  return data
}

export async function getUserInfo(userId: string) {
  const { data } = await Axios.get<ApiResp<{ userInfo: IUser }>>('/user/info', {
    params: {
      userId,
    },
  })
  return data
}

export async function changeUserInfo(userInfo: IUser) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>('/user/chinfo', {
    userInfo,
  })
  return data
}

export async function logout() {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>('/user/logout')
  return data
}

export async function userPosts(userId: string, hasImage: boolean) {
  const { data } = await Axios.get<ApiResp<IPost[]>>('/user/posts', {
    params: { userId, hasImage },
  })
  return data
}

export async function userLikes(userId: string) {
  const { data } = await Axios.get<ApiResp<IPost[]>>('/user/likes', {
    params: {
      userId,
    },
  })
  return data
}
