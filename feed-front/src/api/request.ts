import { Toast } from 'antd-mobile'
import { ToastHandler } from 'antd-mobile/es/components/toast'
import axios from 'axios'

const Axios = axios.create({
  baseURL: '/api',
  timeout: 20000,
})

Axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded;charset=UTF-8'

// 请求前拦截

let toast: ToastHandler
Axios.interceptors.request.use(
  (config) => {
    toast = Toast.show({
      icon: 'loading',
      content: '加载中。。。',
    })
    return config
  },
  (err) => {
    !!toast && toast.close()
    return Promise.reject(err)
  }
)

// 返回后拦截
Axios.interceptors.response.use(
  (res) => {
    !!toast && toast.close()
    if (res.data.code === 0) return res
    else {
      return res
    }
  },
  (err) => {
    !!toast && toast.close()
    if (err.response.data.code === 20005) {
      return err.response
    } else if (err.response.data.code === 20001) {
      return err.response
    } else if (err.response.data.code === 20002) {
      return err.response
    } else if (err.response.data.code === 30001) {
      return err.response
    } else if (err.response.data.code === 30002) {
      return err.response
    } else if (err.response.data.code === 40001) {
      return err.response
    } else if (err.response.data.code === 50001) {
      return err.response
    } else if (err.response.status === 500) {
      return Toast.show({
        icon: 'fail',
        content: '服务端错误',
      })
    } else return Promise.reject(err)
  }
)

export default Axios
