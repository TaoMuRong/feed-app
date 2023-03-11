import { useContext, useRef, useState } from 'react'
import styles from './style.module.scss'
import { Popup, Avatar, TextArea, Toast, Dialog } from 'antd-mobile'
import { context } from '../../hooks/store'
import { ReactComponent as IconDelete } from '../../assets/imgs/deleteImg.svg'
import { ReactComponent as IconPic } from '../../assets/imgs/pic.svg'
import Posts from '../Posts'
import { upload } from '../../api/oss'
import axios from 'axios'
import { IPost } from '../../libs/types'
import { words } from '../../libs/words'
interface IProps {
  post: IPost
  repostPopup: boolean
  setRepostPopup: (repostPopup: boolean) => void
  commentPost: (
    content: string,
    images: string[],
    relativeId: string
  ) => Promise<void>
  repostPost: (
    content: string,
    images: string[],
    relativeId: string,
    relativePost?: IPost | undefined
  ) => Promise<void>
  likePosts: (postId: string) => Promise<void>
  cancelLikePosts: (postId: string) => Promise<void>
  deletePost: (postId: string) => Promise<void>
}
export default function RepostPopup({
  post,
  repostPopup,
  setRepostPopup,
  commentPost,
  repostPost,
  likePosts,
  cancelLikePosts,
  deletePost,
}: IProps) {
  const [images, setImages] = useState([] as ArrayBuffer[])
  const [localImages, setLocalImages] = useState([] as string[])
  const inputFile = useRef<HTMLInputElement>(null)
  const imgNames = useRef([] as string[])
  const [text, setText] = useState('')
  const [visible, setVisible] = useState(false)
  let imgNumber = useRef(0)
  const { userInfo } = useContext(context)
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
    }else if(words.some(word => text.includes(word))) {
      Toast.show({
        icon: 'fail',
        content: '请文明用语',
      })
    }  else {
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
        await repostPost(text, imgNames.current, post.post._id, post)
        setImages([])
        setText('')
        setLocalImages([])
        imgNames.current.splice(0, imgNames.current.length)
        imgNumber.current = 0
        setVisible(false)
        setRepostPopup(false)
      } catch (e) {
        Toast.show({
          icon: 'fail',
          content: '上传失败',
        })
        setRepostPopup(false)
      } finally {
        Toast.clear()
      }
    }
  }
  return (
    <>
      <Popup
        visible={repostPopup}
        onMaskClick={() => {
          setRepostPopup(false)
        }}
        bodyStyle={{ minHeight: '100vh' }}
      >
        <div className={styles.popupHeader}>
          <div className={styles.cancel} onClick={() => setRepostPopup(false)}>
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
              autoSize={{ minRows: 1, maxRows: 3 }}
              className={styles.inputValue}
            />
            {localImages.length > 0 ? (
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
            ) : (
              ''
            )}
            <div className={styles.resPost}>
              <Posts
                post={post}
                deletePost={deletePost}
                type={2}
                commentPost={commentPost}
                repostPost={repostPost}
                likePosts={likePosts}
                cancelLikePosts={cancelLikePosts}
              />
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
