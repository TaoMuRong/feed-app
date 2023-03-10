import { getChatMessageList, listUsersInMessage } from './api/message'

describe('message模块', () => {
  const token = '1e557004-52ac-4242-9bbc-5aa1987fcc58'
  const friendId = '62f21b8967516bf3c570ce93'
  test('获取聊天消息', async () => {
    const { code, data } = await listUsersInMessage(token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })

  test('获取聊天中用户消息', async () => {
    const { code, data } = await getChatMessageList(friendId,token)
    expect(code).toBe(0)
    expect(data).not.toBeNull()
  })
})
