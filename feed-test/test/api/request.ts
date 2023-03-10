import axios from 'axios'

const Axios = axios.create({
  // baseURL: 'http://localhost:8080/api/',
  baseURL: 'http://www.fadinglight.cn:8080/api',
  timeout: 20000,
})

Axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded;charset=UTF-8'

export default Axios
