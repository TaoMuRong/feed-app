import { upload } from './api/oss'

describe('oss模块', () => {
  const token = '1e557004-52ac-4242-9bbc-5aa1987fcc58'

  test('上传图片', async () => {
    const { code, data } = await upload('老贺', token)
    expect(code).toBe(0)
    expect(data.url.length).toBeGreaterThan(0)
  })

})
