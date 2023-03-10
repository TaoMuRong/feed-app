import { useContext } from 'react'
import styles from './style.module.scss'
import { ReactComponent as IconClose } from '../../assets/imgs/close.svg'
import { context } from '../../hooks/store'

export default function ShowPic() {
  const { setImgVisible, imgUrl } = useContext(context)
  return (
    <div className={styles.wrap}>
      <IconClose
        className={styles.close}
        onClick={() => setImgVisible(false)}
      />
      <img className={styles.img} src={imgUrl} alt="" />
      <div className={styles.cover}></div>
    </div>
  )
}
