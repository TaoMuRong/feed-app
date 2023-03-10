import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Main from './pages/Main'
import Home from './pages/Main/Home'
import Search from './pages/Main/Search'
import Notice from './pages/Main/Notice'
import Message from './pages/Main/Message'
import FollowList from './pages/Main/Home/FollowList'
import Thread from './pages/Main/Home/Thread'
import UserHome from './pages/Main/Home/UserHome'
import UserData from './pages/Main/Home/UserData'
import UserCenter from './pages/Main/Home/UserCenter'
import { useMemo, useState } from 'react'
import { Provider } from './hooks/store'
import { EmptyUser, IUser } from './libs/types'
import Chat from './pages/Main/Chat'
import { useWebsocket } from './hooks/useWebsocket'
import { CookiesProvider } from 'react-cookie'

const WebSocketBaseUrl = 'ws://www.fadinglight.cn:8080/ws/conn'

function App() {
  const [postPopupVisible, setPostPopupVisible] = useState(false)
  const [imgVisible, setImgVisible] = useState(false)
  const [badgeShow, setBadgeShow] = useState(false)
  const [userInfo, setUserInfo] = useState<IUser>(EmptyUser)
  const [imgUrl, setImgUrl] = useState('')
  const [messageBadge, setMessageBadge] = useState(0)

  const webSocketUrl = useMemo(() => {
    if (userInfo._id) return `${WebSocketBaseUrl}/${userInfo._id}`
    return null
  }, [userInfo])

  const { wsmessage, sendWsmessage } = useWebsocket(webSocketUrl)

  return (
    <Provider
      value={{
        userInfo,
        postPopupVisible,
        setUserInfo,
        setPostPopupVisible,
        imgVisible,
        setImgVisible,
        imgUrl,
        setImgUrl,
        wsmessage,
        sendWsmessage,
        badgeShow,
        setBadgeShow,
        messageBadge,
        setMessageBadge,
      }}
    >
      <CookiesProvider>
        <BrowserRouter>
          <div className="page">
            <Routes>
              <Route path={'/'} element={<Main />}>
                <Route path="/home" element={<Home />}>
                  <Route
                    path="/home/followList/:_id"
                    element={<FollowList />}
                  />
                  <Route path="/home/thread/:_id" element={<Thread />} />
                  <Route
                    path="/home/userCenter/:_id"
                    element={<UserCenter />}
                  />
                  <Route path="/home/userHome" element={<UserHome />} />
                  <Route path="/home/userData" element={<UserData />} />
                </Route>
                <Route path="/search" element={<Search />} />
                <Route path="/notice" element={<Notice />} />
                <Route path="/message" element={<Message />} />
                <Route path="/chat/:_id" element={<Chat />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CookiesProvider>
    </Provider>
  )
}

export default App
