import Axios from './request'
import { ApiResp, IPost, ISearchUser } from '../libs/types'

export async function searchPosts(words: string, hasImage: boolean) {
  const { data } = await Axios.get<ApiResp<IPost[]>>('/search/post', {
    params: {
      words,
      hasImage,
    },
  })
  return data
}

export async function searchUsers(words: string) {
  const { data } = await Axios.get<ApiResp<ISearchUser[]>>('/search/user', {
    params: {
      words,
    },
  })
  return data
}
