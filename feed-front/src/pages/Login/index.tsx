import { Button, Dialog, Toast } from 'antd-mobile'
import { useNavigate, useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode.react'
import { login, wxlogin, wxlogin2 } from '../../api/user'
import { ReactComponent as IconLogo } from '../../assets/imgs/logo.svg'
import { ReactComponent as IconWechat } from '../../assets/imgs/wechat.svg'
import styles from './style.module.scss'
import { useContext, useEffect } from 'react'
import { context } from '../../hooks/store'
import { IUser } from '../../libs/types'
import { useCookies } from 'react-cookie'

export default function Login() {
  const navigate = useNavigate()
  const { setUserInfo } = useContext(context)

  const [params] = useSearchParams()

  useEffect(() => {
    const code = params.get('code')

    if (code !== null) {
      login(code)
        .then(({ code, data }) => {
          if (code === 0) {
            setUserInfo(data)
            if (!data.account) navigate('/register')
            else navigate('/home/userHome')
          } else navigate('/login')
        })
        .catch(() => navigate('/login'))
    }
  }, [navigate, params, setUserInfo])

  const loginAtWx = async () => {
    const { data } = await wxlogin2()
    const appId = data.appId
    const redirectUri = encodeURIComponent('http://www.fadinglight.cn/login')

    const uri = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`
    window.open(uri, '_self')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cookies, setCookie] = useCookies(['token'])
  const loginByScanning = async () => {
    const { code, message, data } = await wxlogin()
    if (code === 0) {
      // 弹出二维码
      const wxUri = data.wxUri
      const dialog = Dialog.show({
        content: (
          <div className={styles.qrcode}>
            <QRCode value={wxUri} size={200} fgColor="#000000" />
            <div>请扫描二维码登录</div>
          </div>
        ),
        closeOnMaskClick: true,
      })

      // websocket
      const wsc = new WebSocket(
        `ws://www.fadinglight.cn:8080/ws/login/${data.id}`
      )
      wsc.onmessage = (e) => {
        const { userInfo, token } = JSON.parse(e.data) as {
          userInfo: IUser
          token: string
        }
        wsc.close()
        if (code === 0) {
          dialog.close()
          setUserInfo(userInfo)
          if (token === '') navigate('/register')
          else {
            // set token
            setCookie('token', token, {
              path: '/',
            })
            navigate('/home/userHome')
          }
        } else {
          Toast.show({
            icon: 'fail',
            content: message,
          })
        }
      }
    } else {
      Toast.show({
        icon: 'fail',
        content: message,
      })
    }
  }

  const isWeixin = () => {
    const ua = navigator.userAgent.toLowerCase()
    return ua.indexOf('micromessenger') !== -1 && ua.indexOf('wxwork') === -1
  }
  const onlogin = isWeixin() ? loginAtWx : loginByScanning

  const followPublic = () => {
    Dialog.alert({
      content: '请使用微信扫码关注公众号',
      image: '/followPublic.png',
      closeOnMaskClick: true,
    })
  }

  return (
    <div className="main">
      <IconLogo className={styles.logo} />
      <div className={styles.button}>
        <Button
          style={{ '--background-color': '#00BC0C', '--text-color': 'white' }}
          onClick={onlogin}
        >
          <IconWechat className={styles.icon} />
          <span>微信授权登录</span>
        </Button>
        <div className={styles.text}>
          还未关注公众号？
          <span style={{ color: '#00bc0c' }} onClick={followPublic}>
            戳此关注
          </span>
        </div>
      </div>
    </div>
  )
}
