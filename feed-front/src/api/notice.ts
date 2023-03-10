import Axios from './request'
import { ApiResp, INotice } from '../libs/types'

export async function listNotice() {
  const { data } = await Axios.get<ApiResp<INotice[]>>('/notice/list')
  return data
}

export async function rmNotice(noticeId: string) {
  const { data } = await Axios.post<ApiResp<INotice[]>>('/notice/rm', {
    noticeId,
  })
  return data
}

export async function readNotice(noticeId: string) {
  const { data } = await Axios.post<ApiResp<INotice[]>>('/notice/read', {
    noticeId,
  })
  return data
}

export async function unreadNotice(noticeId: string) {
  const { data } = await Axios.post<ApiResp<INotice[]>>('/notice/unread', {
    noticeId,
  })
  return data
}
