import { ActionSheet } from 'antd-mobile'
import type { Action } from 'antd-mobile/es/components/action-sheet'
import { IPost } from '../../libs/types'
interface IProps {
  post: IPost
  deletePopup: boolean
  setDeletePopup: (deletePopup: boolean) => void
  deletePost: (postId: string) => Promise<void>
}
export default function DeletePost({
  post,
  deletePost,
  deletePopup,
  setDeletePopup,
}: IProps) {
  const actions: Action[] = [
    {
      text: '删除帖子',
      key: 'delete',
      danger: true,
      onClick: () => {
        deletePost(post.post._id)
        setDeletePopup(false)
      },
    },
  ]
  return (
    <>
      <ActionSheet
        extra="请选择你要进行的操作"
        cancelText="取消"
        visible={deletePopup}
        actions={actions}
        onClose={() => setDeletePopup(false)}
      />
    </>
  )
}
