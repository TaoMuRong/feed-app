import { createContext } from 'react'
import { IUser } from '../libs/types'
import { IWsMsg } from './useWebsocket/types'
interface StoreContext {
  userInfo: IUser
  setUserInfo: (userInfo: IUser) => void
  postPopupVisible: boolean
  setPostPopupVisible: (postPopupVisible: boolean) => void
  imgVisible: boolean
  setImgVisible: (imgVisible: boolean) => void
  imgUrl: string
  setImgUrl: (imgUrl: string) => void
  wsmessage: IWsMsg | null
  sendWsmessage: (wsmessage: IWsMsg) => void
  badgeShow: boolean
  setBadgeShow: (badgeShow: boolean) => void
  messageBadge: number
  setMessageBadge: (messageBadge: number) => void
}
const context = createContext<StoreContext>({
  userInfo: {} as IUser,
  setUserInfo: () => {},
  postPopupVisible: false,
  setPostPopupVisible: () => {},
  imgVisible: false,
  setImgVisible: () => {},
  imgUrl: '',
  setImgUrl: () => {},
  wsmessage: null,
  sendWsmessage: () => {},
  badgeShow: false,
  setBadgeShow: () => {},
  messageBadge: 0,
  setMessageBadge: () => {},
})
const { Provider } = context
export { context, Provider }
