import styles from './style.module.scss'
import { Avatar, Button } from 'antd-mobile'
import { ReactComponent as IconHome } from '../../assets/imgs/home.svg'
import { ReactComponent as IconPerson } from '../../assets/imgs/person.svg'
import { useContext, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { context } from '../../hooks/store'
import { logout } from '../../api/user'

export default function UserPopup() {
  const navigate = useNavigate()
  const { userInfo } = useContext(context)

  const tabs = useMemo(() => {
    return [
      {
        name: '个人主页',
        link: '/home/userCenter/' + userInfo._id,
        icon: IconHome,
      },
      {
        name: '个人资料',
        link: '/home/userData',
        icon: IconPerson,
      },
    ]
  }, [userInfo._id])
  function logOut() {
    logout()
    navigate('/login')
  }
  return (
    <div className={styles.wrap}>
      <div className={styles.userInfo}>
        <div
          className={styles.avatar}
          onClick={() => navigate('/home/userCenter/' + userInfo._id)}
        >
          <Avatar
            src={
              userInfo.avatar.startsWith('https://thirdwx.qlogo.cn')
                ? userInfo.avatar
                : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${userInfo.avatar}`
            }
            style={{ '--border-radius': '25px', height: '50px', width: '50px' }}
          />
        </div>
        <div className={styles.nickName}>{userInfo.nickname}</div>
        <div className={styles.userName}>{userInfo.account}</div>
        <div
          className={styles.focus}
          onClick={() => navigate('/home/followList/' + userInfo._id)}
        >
          <div className={styles.onFocus}>
            {userInfo.follow.followings} 正在关注
          </div>
          <div className={styles.followers}>
            {userInfo.follow.followeds} 关注者
          </div>
        </div>
        {tabs.map((tab, i) => (
          <NavLink
            to={tab.link}
            className={({ isActive }) =>
              classNames(styles.nav, {
                [styles.active]: isActive,
              })
            }
            state={tab.name}
            key={i}
          >
            <tab.icon className={styles.Itab} />
            <span>{tab.name}</span>
          </NavLink>
        ))}
      </div>
      <Button
        color="danger"
        size="middle"
        className={styles.logout}
        onClick={logOut}
      >
        退出登录
      </Button>
    </div>
  )
}
