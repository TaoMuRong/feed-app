import { cancelFollowUser, fansList, followList, followUser } from './api/follow'

describe('follow模块', () => {
  const token = '1e557004-52ac-4242-9bbc-5aa1987fcc58'
  const followedId = '62ec8edfee4772666ee99ee1'
  const userId = '62f06e07e9d2026515a2b072'

  test('关注用户', async () => {
    const { code, data } = await followUser(followedId,token)
    expect(code).toBe(0)
    expect(data.ok).toBeTruthy()
  })

  test('取消关注用户', async () => {
    const { code, data } = await cancelFollowUser(followedId,token)
    expect(code).toBe(0)
    expect(data.ok).toBeTruthy()
  })

  test('展示关注列表', async () => {
    const { code, data } = await followList(userId,token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })

  test('展示粉丝列表', async () => {
    const { code, data } = await fansList(userId,token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })
})
