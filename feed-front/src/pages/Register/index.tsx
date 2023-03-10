import { Avatar, Button, Toast } from 'antd-mobile'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ReactComponent as IconLogo } from '../../assets/imgs/logo.svg'
import { ReactComponent as IconAt } from '../../assets/imgs/at.svg'
import styles from './style.module.scss'
import { context } from '../../hooks/store'
import { register } from '../../api/user'

export default function Register() {
  const [value, setValue] = useState('@')
  const navigate = useNavigate()
  const { userInfo, setUserInfo } = useContext(context)
  const [warnShow, setWarnShow] = useState(false)

  const userRegister = async () => {
    userInfo.account = value
    const { code, message, data } = await register(userInfo)
    if (code === 0) {
      setUserInfo(data.userInfo)
      navigate('/home/userHome')
    } else {
      Toast.show({
        icon: 'fail',
        content: message,
      })
    }
  }

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 限定用户输入范围和输入长度
    const errValue = e.target.value.replace(/(?!_)(?!.*?_$)[a-zA-Z0-9_]+/g, '')
    if (
      errValue.length > 0 ||
      e.target.value.length > 14 ||
      e.target.value.length === 0
    )
      setWarnShow(true)
    else {
      setWarnShow(false)
      setValue('@' + e.target.value)
    }
  }

  return (
    <div className="main">
      <IconLogo className={styles.logo} />
      <div className={styles.bottom}>
        <div className={styles.content}>
          <Avatar src={userInfo.avatar} style={{ '--border-radius': '50%' }} />
          <span className={styles.nickname}>{userInfo.nickname}</span>
          <div className={styles.input}>
            <span className={styles.icon}>
              <IconAt></IconAt>
            </span>
            <input onChange={(e) => changeValue(e)}></input>
          </div>
          {warnShow ? (
            <span style={{ color: '#ff3141' }}>
              用户名仅允许长度不超过14位的数字，字母，下划线且不能以下划线开头
            </span>
          ) : null}

          <Button
            style={{
              '--background-color': 'var(--color-primary)',
              '--text-color': 'white',
              '--border-radius': '10px',
            }}
            onClick={userRegister}
            block={true}
          >
            <span>注册</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
