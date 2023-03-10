import { cancelFollowUser, fansList, followList, followUser } from './api/follow'
import { listNotice, readNotice, rmNotice, unreadNotice } from './api/notice'

describe('notice模块', () => {
  const token = '1e557004-52ac-4242-9bbc-5aa1987fcc58'
  const noticeId = '62f46257f222d56ff9c880bd'

  test('展示notice列表', async () => {
    const { code, data } = await listNotice(token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })

  test('删除单个notice', async () => {
    const { code, data } = await rmNotice(noticeId,token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })

  test('设为已读', async () => {
    const { code, data } = await readNotice(noticeId,token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })

  test('设为未读', async () => {
    const { code, data } = await unreadNotice(noticeId,token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })
})
