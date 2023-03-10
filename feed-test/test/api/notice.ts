import Axios from "./request";
import { ApiResp, INotice } from "../libs/types";

export async function listNotice(token: string) {
  const { data } = await Axios.get<ApiResp<INotice[]>>('/notice/list', {
    headers: {
      Cookie: `token=${token}`,
    },
  })
  return data
}

export async function rmNotice(noticeId: string, token: string) {
  const { data } = await Axios.post<ApiResp<INotice[]>>('/notice/rm', {
    noticeId
  },
    {
      headers: {
        Cookie: `token=${token}`,
      },
    })
  return data
}

export async function readNotice(noticeId: string, token: string) {
  const { data } = await Axios.post<ApiResp<INotice[]>>('/notice/read', {
    noticeId
  },
    {
      headers: {
        Cookie: `token=${token}`,
      },
    })
  return data
}

export async function unreadNotice(noticeId: string, token: string) {
  const { data } = await Axios.post<ApiResp<INotice[]>>('/notice/unread', {
    noticeId
  },
    {
      headers: {
        Cookie: `token=${token}`,
      },
    })
  return data
}