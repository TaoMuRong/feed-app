import Axios from './request'
import { ApiResp, IPost } from '../libs/types'

export async function addPosts(
  token: string,
  type: number,
  content: string,
  images: string[],
  relativeId?: string
) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean; postId: string }>>(
    '/post/add',
    { type, relativeId, content, images },
    {
      headers: {
        Cookie: `token=${token}`,
      },
    }
  )
  return data
}

export async function listPosts(
  token: string,
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
    headers: {
      Cookie: `token=${token}`,
    },
  })
  return data
}

export async function getPost(postId: string, token: string) {
  const { data } = await Axios.get<ApiResp<IPost>>('/post/getPost', {
    params: {
      postId,
    },
    headers: {
      Cookie: `token=${token}`,
    },
  })
  return data
}

export async function listComments(postId: string, token: string) {
  const { data } = await Axios.get<ApiResp<IPost[]>>('/post/listComments', {
    params: { postId },
    headers: {
      Cookie: `token=${token}`,
    },
  })
  return data
}

export async function deletePosts(postId: string, token: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>(
    '/post/delete',
    {
      postId,
    },
    {
      headers: {
        Cookie: `token=${token}`,
      },
    }
  )
  return data
}

export async function likePosts(postId: string, token: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>(
    '/post/like',
    {
      postId,
    },
    {
      headers: {
        Cookie: `token=${token}`,
      },
    }
  )
  return data
}

export async function cancelLikePosts(postId: string, token: string) {
  const { data } = await Axios.post<ApiResp<{ ok: boolean }>>(
    '/post/cancelLike',
    {
      postId,
    },
    {
      headers: {
        Cookie: `token=${token}`,
      },
    }
  )
  return data
}
