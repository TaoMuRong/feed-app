import Axios from './request'
import { ApiResp, IPost } from '../libs/types'

export async function addPosts(
  type: number,
  content: string,
  images: string[],
  relativeId?: string
) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean; postId: string }>>(
    '/post/add',
    { type, relativeId, content, images }
  )
  return data
}

export async function listPosts(
  next?: string,
  default_?: boolean,
  repost?: boolean,
  comment?: boolean,
  userId?: string
) {
  const { data } = await Axios.get<ApiResp<IPost[]>>('/post/list', {
    params: {
      default_,
      repost,
      comment,
      userId,
      next,
    },
  })
  return data
}

export async function getPost(postId: string) {
  const { data } = await Axios.get<ApiResp<IPost>>('/post/getPost', {
    params: {
      postId,
    },
  })
  return data
}

export async function listComments(postId: string) {
  const { data } = await Axios.get<ApiResp<IPost[]>>('/post/listComments', {
    params: { postId },
  })
  return data
}

export async function deletePosts(postId: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>('/post/delete', {
    postId,
  })
  return data
}

export async function likePosts(postId: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>('/post/like', {
    postId,
  })
  return data
}

export async function cancelLikePosts(postId: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>(
    '/post/cancelLike',
    {
      postId,
    }
  )
  return data
}
