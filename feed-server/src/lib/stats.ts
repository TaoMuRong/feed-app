/**
 * 统一JSON返回封装类
 */
export class JsonResp {
  code: number
  data?: any

  constructor(data?: any, code = 0) {
    this.data = data
    this.code = code
  }
}

/**
 * 错误状态
 */
export class ErrorStat extends JsonResp {
  message: string
  status: number

  constructor(code: number, message: string, status = 200) {
    super(undefined, code)
    this.message = message
    this.status = status
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
    }
  }
}

/**
 * 业务状态错误码
 */
export const stats = {
  ErrorUserNotLogin: new ErrorStat(20001, '用户未登录', 401),
  ErrorTokenException: new ErrorStat(20002, 'token异常', 405),
  ErrorUserNotFound: new ErrorStat(30001, '用户不存在', 404),
  ErrorPostNotFound: new ErrorStat(30002, '帖子不存在', 404),

  ErrorWsConnFail: new ErrorStat(40001, 'websocket连接失败', 405),
  ErrorWsMsgSyntaxError: new ErrorStat(40002, 'message语法错误', 405),

  ErrorDataNotFound: new ErrorStat(50001, '没这条数据', 405),

  ErrorSearch: new ErrorStat(60001, '搜索错误', 405),
}

export default function jsonResp(data) {
  return new JsonResp(data)
}
