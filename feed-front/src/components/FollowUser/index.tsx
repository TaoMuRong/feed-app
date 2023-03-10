import styles from './style.module.scss'
import { Avatar } from 'antd-mobile'
import { ISearchUser } from '../../libs/types'
import { useNavigate } from 'react-router-dom'

interface IProps {
  user: ISearchUser
  followUser: (followedId: string) => Promise<void>
  cancelFollowUser: (followedId: string) => Promise<void>
}

export default function FollowUser({
  user,
  followUser,
  cancelFollowUser,
}: IProps) {
  const navigate = useNavigate()

  function isFollow(isFollowed: boolean, isFollowYou: boolean) {
    if (!isFollowed && !isFollowYou) {
      return '关注'
    }
    if (isFollowYou && !isFollowed) {
      return '回关'
    }
    if (isFollowed) {
      return '正在关注'
    }
  }
  async function focusUser() {
    followUser(user._id)
  }

  async function NofocusUser() {
    cancelFollowUser(user._id)
  }
  return (
    <div className={styles.userWarp}>
      <div
        className={styles.avatar}
        onClick={() => navigate('/home/userCenter/' + user._id)}
      >
        <Avatar
          src={
            user.avatar.startsWith('https://thirdwx.qlogo.cn')
              ? user.avatar
              : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${user.avatar}`
          }
          style={{ '--border-radius': '25px' }}
        />
      </div>
      <div className={styles.userInfo}>
        <div className={styles.userTitle}>
          <div
            className={styles.userHeader}
            onClick={() => navigate('/home/userCenter/' + user._id)}
          >
            <div className={styles.nickName}>{user.nickname}</div>
            <div className={styles.userName}>{user.account}</div>
          </div>
          {user.status.isFollowed ? (
            <div className={styles.focusButton} onClick={NofocusUser}>
              {isFollow(user.status.isFollowed, user.status.isFollowYou)}
            </div>
          ) : (
            <div className={styles.NofocusButton} onClick={focusUser}>
              {isFollow(user.status.isFollowed, user.status.isFollowYou)}
            </div>
          )}
        </div>
        <div
          className={styles.userIntroduction}
          onClick={() => navigate('/home/userCenter/' + user._id)}
        >
          {user.bio}
        </div>
      </div>
    </div>
  )
}
