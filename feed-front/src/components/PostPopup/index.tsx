import { useContext, useRef, useState } from 'react'
import styles from './style.module.scss'
import { Popup, Avatar, TextArea, Toast, Dialog } from 'antd-mobile'
import { context } from '../../hooks/store'
import { ReactComponent as IconDelete } from '../../assets/imgs/deleteImg.svg'
import { ReactComponent as IconPic } from '../../assets/imgs/pic.svg'
import { upload } from '../../api/oss'
import axios from 'axios'
interface IProps {
  addPost: (content: string, images: string[]) => Promise<void>
}

export default function PostPopup({ addPost }: IProps) {
  const [text, setText] = useState('')
  const [images, setImages] = useState([] as ArrayBuffer[])
  const [localImages, setLocalImages] = useState([] as string[])
  const inputFile = useRef<HTMLInputElement>(null)
  const imageNames = useRef([] as string[])
  const [visible, setVisible] = useState(false)
  let imgNumber = useRef(0)
  const { postPopupVisible, setPostPopupVisible, userInfo } =
    useContext(context)
  //本地上传
  function uploadImg() {
    const reader = new FileReader()
    const readerLocal = new FileReader()
    reader.readAsArrayBuffer(inputFile.current!.files![0])
    readerLocal.readAsDataURL(inputFile.current!.files![0])
    //本地展示
    if (imgNumber.current < 4) {
      readerLocal.onload = function (e) {
        localImages.push(e.target?.result as string)
        setLocalImages([...localImages])
        imgNumber.current += 1
      }
    } else {
      Toast.show({
        icon: 'fail',
        content: '只能上传4张图片哦',
      })
    }
    //用于上传
    if (imgNumber.current <= 4 && imageNames.current.length < 4) {
      reader.onload = function (e) {
        images.push(e.target?.result as ArrayBuffer)
        const fileArr = inputFile.current!.files![0].name.split('.')
        imageNames.current.push(
          Math.random() + '.' + fileArr[fileArr.length - 1]
        )
        setImages([...images])
      }
    }
  }
  //本地上传
  function deleteImg(index: number) {
    images.splice(index, 1)
    imgNumber.current -= 1
    localImages.splice(index, 1)
    imageNames.current.splice(index, 1)
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
          const reName = imageNames.current[index]
          const configs = {
            headers: { 'Content-Type': 'image' },
          }
          const res = await upload(reName)
          await axios
            .put(res.data.url, item, configs)
            .catch((err) => console.log(err))

          index++
        }
        await addPost(text, imageNames.current)
        setImages([])
        setText('')
        setLocalImages([])
        imageNames.current.splice(0, imageNames.current.length)
        imgNumber.current = 0
        setVisible(false)
        setPostPopupVisible(false)
      } catch (e) {
        Toast.show({
          icon: 'fail',
          content: '上传失败',
        })
        setPostPopupVisible(false)
      } finally {
        Toast.clear()
      }
    }
  }
  return (
    <>
      <Popup
        visible={postPopupVisible}
        onMaskClick={() => {
          setPostPopupVisible(false)
        }}
        bodyStyle={{ minHeight: '100vh' }}
      >
        <div className={styles.popupHeader}>
          <div
            className={styles.cancel}
            onClick={() => setPostPopupVisible(false)}
          >
            取消
          </div>
          <div className={styles.pubsub} onClick={pubSub}>
            发布
          </div>
        </div>
        <div className={styles.contentWarp}>
          <div className={styles.avatarBox}>
            <Avatar
              src={
                userInfo.avatar.startsWith('https://thirdwx.qlogo.cn')
                  ? userInfo.avatar
                  : `https://feed-fadinglight.oss-cn-hangzhou.aliyuncs.com/imgs/${userInfo.avatar}`
              }
              style={{ '--border-radius': '25px' }}
            />
          </div>
          <div className={styles.content}>
            <TextArea
              value={text}
              maxLength={280}
              showCount
              onChange={(v) => setText(v)}
              placeholder="请输入内容"
              autoSize={{ minRows: 1, maxRows: 7 }}
              className={styles.inputtext}
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
            onClick={() => {
              inputFile.current?.click()
            }}
          />
        </div>
        <Dialog visible={visible} content="正在上传中，请稍后..." />
      </Popup>
    </>
  )
}
