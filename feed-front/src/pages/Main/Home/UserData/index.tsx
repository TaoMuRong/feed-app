import {
  Form,
  Input,
  NavBar,
  TextArea,
  Toast,
  Image,
  Dialog,
} from 'antd-mobile'
import axios from 'axios'
import { useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ReactComponent as IconBack } from '../../../../assets/imgs/back.svg'
import { context } from '../../../../hooks/store'
import { IUser } from '../../../../libs/types'
import styles from './style.module.scss'
import { upload } from '../../../../api/oss'
import { changeUserInfo } from '../../../../api/user'

export default function UserData() {
  const navigate = useNavigate()
  const { userInfo, setUserInfo } = useContext(context)
  const [form] = Form.useForm()
  const updateInfo = useRef<IUser>(userInfo)
  const backgroundFile = useRef<HTMLInputElement>(null)
  const [backgroundLocal, setBackgroundLocal] = useState(userInfo.background)
  const backgroundRemote = useRef<ArrayBuffer>()
  const avatarFile = useRef<HTMLInputElement>(null)
  const [avatarLocal, setAvatarLocal] = useState(userInfo.avatar)
  const avatarRemote = useRef<ArrayBuffer>()
  const [visible, setVisible] = useState(false)

  const back = () => {
    navigate(-1)
  }

  const save = async () => {
    setVisible(true)
    updateInfo.current.avatar = userInfo.avatar
    updateInfo.current.background = userInfo.background
    updateInfo.current._id = userInfo._id
    updateInfo.current.account = userInfo.account
    updateInfo.current.createdAt = userInfo.createdAt
    updateInfo.current.follow = userInfo.follow
    updateInfo.current.status = userInfo.status
    updateInfo.current.wxId = userInfo.wxId
    if (backgroundFile.current!.files![0]) {
      const backgroundFileArr =
        backgroundFile.current!.files![0].name.split('.')
      const backgroundFillName =
        Math.random() + '.' + backgroundFileArr[backgroundFileArr.length - 1]
      await upload(backgroundFillName).then(async (res) => {
        await axios
          .put(res.data.url, backgroundRemote.current, {
            headers: { 'Content-Type': 'image' },
          })
          .catch((err) => console.log(err))
      })
      updateInfo.current.background = backgroundFillName
    }
    if (avatarFile.current!.files![0]) {
      const avatarFileArr = avatarFile.current!.files![0].name.split('.')
      const avatarFillName =
        Math.random() + '.' + avatarFileArr[avatarFileArr.length - 1]
      await upload(avatarFillName).then(async (res) => {
        await axios
          .put(res.data.url, avatarRemote.current, {
            headers: { 'Content-Type': 'image' },
          })
          .catch((err) => console.log(err))
      })
      updateInfo.current.avatar = avatarFillName
    }
    updateInfo.current.nickname = form.getFieldValue('nickName')
    if (
      updateInfo.current.nickname.length > 8 ||
      updateInfo.current.nickname.length === 0
    ) {
      setVisible(false)
      Toast.show({
        icon: 'false',
        content: '长度不能为0或者超过8个字符',
      })
    } else {
      updateInfo.current.bio = form.getFieldValue('bio')
      setUserInfo(updateInfo.current)
      const { code, message } = await changeUserInfo(updateInfo.current)
      setVisible(false)
      if (code === 0)
        Toast.show({
          icon: 'success',
          content: '保存成功',
        })
      else
        Toast.show({
          icon: 'fail',
          content: message,
        })
    }
  }

  const backgroundClick = async () => {
    backgroundFile.current?.click()
  }

  const avatarClick = async () => {
    avatarFile.current?.click()
  }

  const backgroundChange = () => {
    const readerLocal = new FileReader()
    readerLocal.readAsDataURL(backgroundFile.current!.files![0])
    readerLocal.onload = function (e) {
      setBackgroundLocal(e.target?.result as string)
    }
    const readerRemote = new FileReader()
    readerRemote.readAsArrayBuffer(backgroundFile.current!.files![0])
    readerRemote.onload = function (e) {
      backgroundRemote.current = e.target?.result as ArrayBuffer
    }
  }

  const avatarChange = () => {
    const readerLocal = new FileReader()
    readerLocal.readAsDataURL(avatarFile.current!.files![0])
    readerLocal.onload = function (e) {
      setAvatarLocal(e.target?.result as string)
    }
    const readerRemote = new FileReader()
    readerRemote.readAsArrayBuffer(avatarFile.current!.files![0])
    readerRemote.onload = function (e) {
      avatarRemote.current = e.target?.result as ArrayBuffer
    }
  }

  return (
    <>
      <NavBar
        backArrow={<IconBack />}
        onBack={back}
        right={<span onClick={save}>保存</span>}
      >
        编辑个人资料
      </NavBar>
      <div className={styles.imgs}>
        <img
          src={
            backgroundLocal
              ? backgroundLocal.startsWith(userInfo.background)
                ? `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${backgroundLocal}`
                : backgroundLocal
              : '/defaultImg.png'
          }
          alt="背景图片"
          className={styles.background}
        />
        <div className={styles.backgroundMask} onClick={backgroundClick}></div>
        <div className={styles.avatar}>
          <Image
            src={
              avatarLocal.startsWith('https://thirdwx.qlogo.cn') ||
              avatarLocal.startsWith('data:image/')
                ? avatarLocal
                : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${avatarLocal}`
            }
            width={54}
            height={54}
            fit="cover"
            style={{ borderRadius: 27 }}
          />
        </div>
        <div className={styles.avatarMask} onClick={avatarClick}></div>
      </div>
      <div className={styles.uploadFile}>
        <input type="file" ref={backgroundFile} onChange={backgroundChange} />
        <input type="file" ref={avatarFile} onChange={avatarChange} />
      </div>
      <div className={styles.updateText}>
        <Form layout="horizontal" form={form}>
          <Form.Item
            name="nickName"
            label="姓名"
            initialValue={userInfo.nickname}
          >
            <Input style={{ '--color': '#3291FF' }} />
          </Form.Item>
          <Form.Item name="bio" label="简介" initialValue={userInfo.bio}>
            <TextArea
              placeholder="请输入简介"
              maxLength={100}
              rows={4}
              style={{ '--color': '#3291FF' }}
            />
          </Form.Item>
        </Form>
      </div>
      <Dialog visible={visible} content="正在上传中，请稍后..." />
    </>
  )
}
