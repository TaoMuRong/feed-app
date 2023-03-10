import { useContext } from 'react'
import styles from './style.module.scss'
import { ReactComponent as IconAdd } from '../../assets/imgs/add.svg'
import { context } from '../../hooks/store'
export default function AddPost() {
  const { setPostPopupVisible } = useContext(context)
  return (
    <div className={styles.wrap}>
      <IconAdd
        className={styles.iconAdd}
        onClick={() => setPostPopupVisible(true)}
      />
    </div>
  )
}
