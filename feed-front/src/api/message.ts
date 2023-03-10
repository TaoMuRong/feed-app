import Axios from './request'
import { ApiResp, IMessage, IMsgInList } from '../libs/types'

export async function listUsersInMessage() {
  const { data } = await Axios.get<ApiResp<IMsgInList[]>>('/message/getUsers')
  return data
}

export async function getChatMessageList(
  friendId: string,
  prev?: string | null,
  limit?: number | null
) {
  const { data } = await Axios.get<ApiResp<IMessage[]>>(
    `/message/getFriendsMessageList?friendId=${friendId}&prev=${
      prev ?? ''
    }&limit=${limit}`
  )
  return data
}

export async function deleteOneMessage(messageId: string) {
  const { data } = await Axios.post<ApiResp<IMessage>>(
    `/message/deleteOneMessage/${messageId}`
  )
  return data
}

export async function readAll(friendId: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>(
    `/message/readAll/${friendId}`
  )
  return data
}

export async function deleteOneMessageList(friendId: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>(
    `/message/deleteOneMessageList/${friendId}`
  )
  return data
}
