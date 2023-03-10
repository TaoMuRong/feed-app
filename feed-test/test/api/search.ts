import Axios from './request'
import { ApiResp, IPost, ISearchUser } from '../libs/types'

export async function searchPosts(
  words: string,
  hasImage: boolean,
  token: string
) {
  const { data } = await Axios.get<ApiResp<IPost[]>>('/search/post', {
    params: {
      words,
      hasImage,
    },
    headers: {
      Cookie: `token=${token}`,
    },
  })
  return data
}

export async function searchUsers(words: string, token: string) {
  const { data } = await Axios.get<ApiResp<ISearchUser[]>>('/search/user', {
    params: {
      words,
    },
    headers: {
      Cookie: `token=${token}`,
    },
  })
  return data
}
