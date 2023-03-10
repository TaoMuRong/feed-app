import { Empty, NavBar, Tabs, Toast } from 'antd-mobile'
import { useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ReactComponent as IconBack } from '../../../../assets/imgs/back.svg'
import FollowUser from '../../../../components/FollowUser'
import useFollowList from '../../../../hooks/useFollowList'
import { getUserInfo } from '../../../../api/user'
import styles from './style.module.scss'

export default function FollowList() {
  const tabs = ['关注者', '正在关注']
  const navigate = useNavigate()
  const { _id } = useParams()
  let userNickname = useRef('')
  const { users, listFollows, listFans, followUser, cancelFollowUser } =
    useFollowList(_id as string)

  const back = () => {
    navigate(-1)
  }

  useMemo(async () => {
    const { code, message, data } = await getUserInfo(_id as string)
    if (code === 0) {
      userNickname.current = data.userInfo.nickname
    } else {
      Toast.show({
        icon: 'fail',
        content: message,
      })
    }
  }, [_id])

  const check = async (item: string) => {
    if (item === '关注者') listFans(_id as string)
    else listFollows(_id as string)
  }

  return (
    <>
      <NavBar onBack={back} backArrow={<IconBack />} className={styles.tabBar}>
        {userNickname.current}
      </NavBar>
      <Tabs onChange={check}>
        {tabs.map((tab) => (
          <Tabs.Tab title={tab} key={tab} />
        ))}
      </Tabs>
      {users.length === 0 ? (
        <Empty description="此人还未关注任何人" />
      ) : (
        users.map((user) => (
          <FollowUser
            user={user}
            key={user._id}
            followUser={followUser}
            cancelFollowUser={cancelFollowUser}
          ></FollowUser>
        ))
      )}
    </>
  )
}
