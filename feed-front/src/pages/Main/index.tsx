import { Badge, TabBar, Toast } from 'antd-mobile'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'

import { ReactComponent as IconHome } from '../../assets/imgs/home.svg'
import { ReactComponent as IconSearch } from '../../assets/imgs/search.svg'
import { ReactComponent as IconNotice } from '../../assets/imgs/notice-fill.svg'
import { ReactComponent as IconMesage } from '../../assets/imgs/message.svg'
import { getInfo } from '../../api/user'
import { context } from '../../hooks/store'

export default function Main() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUserInfo, badgeShow, messageBadge } = useContext(context)
  const [activeKey, setActiveKey] = useState('')

  useEffect(() => {
    if (location.pathname.startsWith('/home')) setActiveKey('/home/userHome')
    else if (location.pathname.startsWith('/chat')) setActiveKey('/message')
    else setActiveKey(location.pathname)
  }, [location.pathname, navigate])

  useEffect(() => {
    getInfo().then((res) => {
      if (res.code === 0) {
        if (location.pathname === '/') navigate('/home/userHome')
        setUserInfo(res.data.userInfo)
      } else if (res.code === 20001) navigate('/login')
      else
        Toast.show({
          icon: 'fail',
          content: res.message,
        })
    })
  }, [location.pathname, navigate, setUserInfo])

  const tabs = [
    {
      key: '/home/userHome',
      icon: <IconHome />,
    },
    {
      key: '/search',
      icon: <IconSearch />,
    },
    badgeShow
      ? {
          key: '/notice',
          icon: <IconNotice />,
          badge: Badge.dot,
        }
      : {
          key: '/notice',
          icon: <IconNotice />,
        },
    messageBadge === 0
      ? {
          key: '/message',
          icon: <IconMesage />,
        }
      : {
          key: '/message',
          icon: <IconMesage />,
          badge: `${messageBadge}`,
        },
  ]

  return (
    <>
      <div className="main">
        <Outlet />
      </div>
      <TabBar
        safeArea
        className="navbar"
        onChange={(key) => navigate(key)}
        activeKey={activeKey}
      >
        {tabs.map((item) => (
          <TabBar.Item key={item.key} icon={item.icon} badge={item.badge} />
        ))}
      </TabBar>
    </>
  )
}
