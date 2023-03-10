import { wxloginTest, login, register, logout } from './api/user'
import { IUser } from './libs/types'

describe('用户模块', () => {
  const token = '83409b36-b5e9-4dba-a686-18e7b88b3d7b'
  let userInfo = {
    account: '@taotao',
    wxId: 'oHgyp5jGfPO7tTZsRWBJpEkg_R_s',
    nickname: '涛涛',
    avatar:
      'https://thirdwx.qlogo.cn/mmopen/vi_32/v1GhjxZJkyAHJzSe5TmktLN6JMWrPfRQ6eFEteweib47Vbnll7B22KfE6gYJXMycxticT6KJmtSygWWNWtvOD0qg/132',
  } as IUser

  test('微信三方登录', async () => {
    const { code, data } = await wxloginTest()
    expect(code).toBe(0)
    expect(data.appId.length).toBeGreaterThan(0)
    expect(data.uri.length).toBeGreaterThan(0)
  })

  test('用户注册', async () => {
    const { code, data } = await register(userInfo)
    expect(code).toBe(0)
    userInfo = data.userInfo
  })

  test('用户退出登录', async () => {
    const { code, data } = await logout(token)
    expect(code).toBe(0)
    expect(data.ok).toBeTruthy()
  })
})
