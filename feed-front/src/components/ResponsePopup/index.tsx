import { useContext, useRef, useState } from 'react'
import styles from './style.module.scss'
import { Popup, Avatar, TextArea, Toast, Dialog } from 'antd-mobile'
import { context } from '../../hooks/store'
import { upload } from '../../api/oss'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ReactComponent as IconDelete } from '../../assets/imgs/deleteImg.svg'
import { ReactComponent as IconPic } from '../../assets/imgs/pic.svg'
import { IPost } from '../../libs/types'

interface IProps {
  post: IPost
  responsePopup: boolean
  setResponsePopup: (responsePopup: boolean) => void
  commentPost: (
    content: string,
    images: string[],
    relativeId: string
  ) => Promise<void>
}
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')
function computedTime(time: number) {
  if (dayjs(time).isBefore(dayjs().subtract(14, 'day')))
    return dayjs().format('YYYY-MM-DD')
  else return dayjs(time).fromNow()
}
export default function ResponsePopup({
  post,
  responsePopup,
  setResponsePopup,
  commentPost,
}: IProps) {
  const [images, setImages] = useState([] as ArrayBuffer[])
  const [localImages, setLocalImages] = useState([] as string[])
  const inputFile = useRef<HTMLInputElement>(null)
  const imgNames = useRef([] as string[])
  const [text, setText] = useState('')
  const { userInfo, setImgUrl, setImgVisible } = useContext(context)
  const [visible, setVisible] = useState(false)
  let imgNumber = useRef(0)
  const createTime = computedTime(post.post.createdAt)
  //本地上传
  function uploadImg() {
    const reader = new FileReader()
    const readerLocal = new FileReader()
    reader.readAsArrayBuffer(inputFile.current!.files![0])
    readerLocal.readAsDataURL(inputFile.current!.files![0])
    //本地展示
    if (imgNumber.current <= 4) {
      readerLocal.onload = function (e) {
        localImages.push(e.target?.result as string)
        setLocalImages([...localImages])
      }
    } else {
      Toast.show({
        icon: 'fail',
        content: '只能上传4张图片哦',
      })
    }
    //用于上传
    if (imgNumber.current <= 4 && imgNames.current.length < 4) {
      reader.onload = function (e) {
        images.push(e.target?.result as ArrayBuffer)
        const fileArr = inputFile.current!.files![0].name.split('.')
        imgNames.current.push(Math.random() + '.' + fileArr[fileArr.length - 1])
        setImages([...images])
      }
    }
  }
  //本地上传
  function deleteImg(index: number) {
    images.splice(index, 1)
    imgNumber.current -= 1
    localImages.splice(index, 1)
    imgNames.current.splice(index, 1)
    setImages([...images])
    setLocalImages([...localImages])
  }
  //上传云端
  async function pubSub() {
    if (text === '') {
      Toast.show({
        icon: 'fail',
        content: '内容不能为空哦',
      })
    } else {
      try {
        setVisible(true)
        let index = 0
        for (const item of images) {
          const reName = imgNames.current[index]
          const configs = {
            headers: { 'Content-Type': 'image' },
          }
          const res = await upload(reName)
          await axios
            .put(res.data.url, item, configs)
            .catch((err) => console.log(err))

          index++
        }
        await commentPost(text, imgNames.current, post.post._id)
        setImages([])
        setText('')
        setLocalImages([])
        imgNames.current.splice(0, imgNames.current.length)
        imgNumber.current = 0
        setVisible(false)
        setResponsePopup(false)
      } catch (e) {
        Toast.show({
          icon: 'fail',
          content: '上传失败',
        })
        setResponsePopup(false)
      } finally {
        Toast.clear()
      }
    }
  }
  return (
    <>
      <Popup
        visible={responsePopup}
        onMaskClick={() => {
          setResponsePopup(false)
        }}
        bodyStyle={{ minHeight: '100vh' }}
      >
        <div className={styles.popupHeader}>
          <div
            className={styles.cancel}
            onClick={() => setResponsePopup(false)}
          >
            取消
          </div>
          <div className={styles.pubsub} onClick={pubSub}>
            发布
          </div>
        </div>
        <div className={styles.contentWarp}>
          <div className={styles.lord}>
            <div className={styles.avatar}>
              <Avatar
                className={styles.person}
                src={
                  post.user.avatar.startsWith('https://thirdwx.qlogo.cn')
                    ? post.user.avatar
                    : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${post.user.avatar}`
                }
                style={{ '--border-radius': '25px' }}
              />
              <div className={styles.line}></div>
            </div>
            <div className={styles.contentBox}>
              <div className={styles.contentTitle}>
                <div className={styles.nickName}>{post.user.nickname}</div>
                <div
                  className={styles.userName}
                >{`${post.user.account} · ${createTime}`}</div>
              </div>
              <div className={styles.content}>
                <span className={styles.word}>{post.post.content}</span>
              </div>
              <div className={styles.imgBox}>
                {post.post.images.map((item) => {
                  return (
                    <img
                      className={styles.img}
                      src={`https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${item}?x-oss-process=image/resize,w_200`}
                      alt=""
                      key={item}
                      onClick={() => {
                        setImgVisible(true)
                        setImgUrl(
                          `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${item}`
                        )
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
          <div className={styles.resLoad}>
            <div className={styles.avatarBox}>
              <Avatar
                src={
                  userInfo.avatar.startsWith('https://thirdwx.qlogo.cn')
                    ? userInfo.avatar
                    : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${userInfo.avatar}`
                }
                style={{
                  '--border-radius': '25px',
                  width: '50px',
                  height: '50px',
                }}
              />
            </div>
            <div className={styles.authorContent}>
              <div className={styles.responseAuthor}>
                回复 <span className={styles.author}>{post.user.account}</span>
              </div>
              <TextArea
                value={text}
                maxLength={280}
                showCount
                onChange={(v) => setText(v)}
                placeholder="请输入内容"
                autoSize={{ minRows: 1, maxRows: 3 }}
                className={styles.inputValue}
              />
              <div className={styles.imgBox}>
                {localImages.map((item, index) => {
                  return (
                    <div className={styles.showImg} key={item}>
                      <img className={styles.img} src={item} alt="" />
                      <div className={styles.delete}>
                        <IconDelete onClick={() => deleteImg(index)} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <img src="" alt="" />
          <input
            type="file"
            ref={inputFile}
            id="file"
            className={styles.file}
            onChange={uploadImg}
          ></input>
          <IconPic
            className={styles.Icon}
            onClick={() => inputFile.current?.click()}
          />
        </div>
        <Dialog visible={visible} content="正在上传中，请稍后..." />
      </Popup>
    </>
  )
}
