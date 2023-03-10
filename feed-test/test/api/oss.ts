import Axios from './request'
import { ApiResp } from '../libs/types'

export async function upload(imgName: string, token: string) {
  const { data } = await Axios.post<ApiResp<{ url: string }>>('/img/upload', {
    imgName,
  },
    {
      headers: {
        Cookie: `token=${token}`,
      },
    }
  )
  return data
}

// export async function download(imgUrl: string,token: string, type?: string) {
//   const { data } = await Axios.get<ApiResp<{ url: string }>>('/search/post', {
//     params: {
//       imgUrl,
//       type,
//     },
//     headers: {
//       Cookie: `token=${token}`,
//     },
//   })
//   return data
// }
