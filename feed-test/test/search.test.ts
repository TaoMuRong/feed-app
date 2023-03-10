import { searchPosts, searchUsers } from './api/search'

describe('搜索模块', () => {
  const word = '啊'
  const userName = '涛涛'
  const token = '1931a37f-d07f-4a8b-9bd9-61018ee3eb26'

  test('搜索帖子', async () => {
    const { code, data } = await searchPosts(word, false, token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })

  test('搜索图片帖子', async () => {
    const { code, data } = await searchPosts(word, true, token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })

  test('搜索用户', async () => {
    const { code, data } = await searchUsers(userName, token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })
})
