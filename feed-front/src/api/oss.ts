import Axios from './request'
import { ApiResp } from '../libs/types'

export async function upload(imgName: string) {
  const { data } = await Axios.post<ApiResp<{ url: string }>>('/img/upload', {
    imgName,
  })
  return data
}

export async function download(imgUrl: string, type?: string) {
  const { data } = await Axios.get<ApiResp<{ url: string }>>('/search/post', {
    params: {
      imgUrl,
      type,
    },
  })
  return data
}
