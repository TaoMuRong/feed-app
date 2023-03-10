import {
  addPosts,
  cancelLikePosts,
  deletePosts,
  getPost,
  likePosts,
  listComments,
  listPosts,
} from './api/posts'

describe('帖子模块', () => {
  const word = '啊'
  const userName = '涛涛'
  const token = '1931a37f-d07f-4a8b-9bd9-61018ee3eb26'
  let relativeId = ''

  test('添加主题帖', async () => {
    const { code, data } = await addPosts(token, 1, word, [])
    expect(code).toBe(0)
    expect(data).not.toBeNull()
    relativeId = data.postId
  })

  test('添加回复帖', async () => {
    const { code, data } = await addPosts(token, 2, word, [], relativeId)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
    relativeId = data.postId
  })

  test('添加转发帖', async () => {
    const { code, data } = await addPosts(token, 3, word, [], relativeId)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
    relativeId = data.postId
  })

  test('查看帖子列表', async () => {
    const { code, data } = await listPosts(token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
    relativeId = data[data.length - 1].post._id
  })

  test('查看下一页帖子列表', async () => {
    const { code, data } = await listPosts(token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })

  test('获取单个帖子信息', async () => {
    const { code, data } = await getPost(relativeId, token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })

  test('获取评论列表', async () => {
    const { code, data } = await listComments(relativeId, token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })

  test('点赞帖子', async () => {
    const { code, data } = await likePosts(relativeId, token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })

  test('取消点赞帖子', async () => {
    const { code, data } = await cancelLikePosts(relativeId, token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })

  test('删除帖子', async () => {
    const { code, data } = await deletePosts(relativeId, token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })
})
