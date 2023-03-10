import { Divider, Empty, PullToRefresh, Tabs, Toast } from 'antd-mobile'
import { useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ReactComponent as IconSearch } from '../../../assets/imgs/search.svg'
import { ReactComponent as IconUp } from '../../../assets/imgs/up.svg'
import { ReactComponent as IconDelete } from '../../../assets/imgs/delete.svg'
import { ReactComponent as IconBack } from '../../../assets/imgs/back.svg'
import styles from './style.module.scss'
import AddPost from '../../../components/AddPost'
import PostPopup from '../../../components/PostPopup'
import FollowUser from '../../../components/FollowUser'
import useSearch from '../../../hooks/useSearch'
import Posts from '../../../components/Posts'
import ShowPic from '../../../components/ShowPic'
import { context } from '../../../hooks/store'

export default function Search() {
  const tabs = ['帖子', '用户', '照片']
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)
  const { imgVisible } = useContext(context)
  let initSearch = localStorage.getItem('recentSearch')
  initSearch = initSearch === null ? '[]' : initSearch
  const [recentSearch, setRecentSearch] = useState<string[]>(
    JSON.parse(initSearch)
  )
  const [searchClick, setSearchClick] = useState(false)
  const [searchEnter, setSearchEnter] = useState(false)
  const checkedTab = useRef(tabs[0])
  const input = useRef<HTMLInputElement>(null)
  const content = useRef('')
  const {
    posts,
    users,
    searchUsers,
    searchPosts,
    commentPost,
    repostPost,
    likePosts,
    addPost,
    followUser,
    cancelFollowUser,
    cancelLikePosts,
    deletePost,
  } = useSearch()

  const search = async (event: any) => {
    if (event.key === 'Enter' && input.current!.value !== '') {
      // 防止用户输入字符过长，对搜索历史按时间倒叙排序，删除重复搜索项
      content.current = input.current!.value
      if (content.current.length < 14) {
        const delIndex = recentSearch.indexOf(content.current)
        if (delIndex > -1) {
          recentSearch.splice(delIndex, 1)
        }
        recentSearch.unshift(content.current)
        localStorage.setItem('recentSearch', JSON.stringify(recentSearch))
        setSearchEnter(true)
        await searchPosts(content.current, false)
      } else
        Toast.show({
          icon: 'fail',
          content: '长度不能超过14个字符',
        })
    }
  }

  const del = () => {
    setRecentSearch([])
    localStorage.setItem('recentSearch', JSON.stringify([]))
  }

  const up = (item: string) => {
    input.current!.value = item
    input.current?.focus()
  }

  const back = () => {
    setSearchEnter(false)
  }

  const check = async (item: string) => {
    checkedTab.current = item
    if (checkedTab.current === '帖子') {
      await searchPosts(content.current, false)
    } else if (checkedTab.current === '用户') {
      await searchUsers(content.current)
    } else if (checkedTab.current === '照片') {
      await searchPosts(content.current, true)
    }
  }

  const refresh = async () => {
    if (checkedTab.current === '帖子') {
      await searchPosts(content.current, false)
    } else if (checkedTab.current === '用户') {
      await searchUsers(content.current)
    } else if (checkedTab.current === '照片') {
      await searchPosts(content.current, true)
    }
  }

  const searchAll = async (event: any) => {
    if (event.key === 'Enter' && input.current!.value !== '') {
      content.current = input.current!.value
      if (content.current.length < 14) {
        const delIndex = recentSearch.indexOf(content.current)
        if (delIndex > -1) {
          recentSearch.splice(delIndex, 1)
        }
        recentSearch.unshift(content.current)
        localStorage.setItem('recentSearch', JSON.stringify(recentSearch))
        setSearchEnter(true)
        if (checkedTab.current === '帖子') {
          searchPosts(content.current, false)
        } else if (checkedTab.current === '用户') {
          searchUsers(content.current)
        } else if (checkedTab.current === '照片') {
          searchPosts(content.current, true)
        }
      } else
        Toast.show({
          icon: 'fail',
          content: '长度不能超过14个字符',
        })
    }
  }

  const cancel = () => {
    navigate('/home/userHome')
  }

  return (
    <>
      {searchEnter ? (
        <div className={styles.container}>
          <div className={styles.tabBar}>
            <div className={styles.top}>
              <IconBack className={styles.back} onClick={back} />
              <div className={styles.input}>
                {searchClick ? (
                  <IconSearch style={{ color: 'var(--color-text-3)' }} />
                ) : (
                  <IconSearch />
                )}
                <input
                  placeholder="搜索"
                  ref={input}
                  onKeyUp={searchAll}
                  onClick={() => setSearchClick(true)}
                  defaultValue={content.current}
                />
              </div>
            </div>
            <div onClick={() => setSearchClick(false)}>
              <Divider />
              <Tabs onChange={check}>
                {tabs.map((tab) => (
                  <Tabs.Tab title={tab} key={tab} />
                ))}
              </Tabs>
            </div>
          </div>
          <PullToRefresh onRefresh={refresh}>
            {checkedTab.current === '用户' ? (
              users.length === 0 ? (
                <Empty description="未搜索到用户相关信息" />
              ) : (
                <div ref={searchRef}>
                  {users.map((user, index) => (
                    <FollowUser
                      user={user}
                      key={index}
                      followUser={followUser}
                      cancelFollowUser={cancelFollowUser}
                    />
                  ))}
                </div>
              )
            ) : posts.length === 0 ? (
              <Empty description="未搜索到相关帖子" />
            ) : (
              <div ref={searchRef}>
                {posts.map((post, index) => (
                  <Posts
                    deletePost={deletePost}
                    post={post}
                    type={1}
                    key={index}
                    commentPost={commentPost}
                    repostPost={repostPost}
                    likePosts={likePosts}
                    cancelLikePosts={cancelLikePosts}
                  />
                ))}
              </div>
            )}
          </PullToRefresh>
        </div>
      ) : (
        <div className={styles.container}>
          <div className={styles.tabBar}>
            <div className={styles.top}>
              <div className={styles.input}>
                {searchClick ? (
                  <IconSearch style={{ color: 'var(--color-text-3)' }} />
                ) : (
                  <IconSearch />
                )}

                <input
                  placeholder="搜索"
                  ref={input}
                  onKeyUp={search}
                  onClick={() => setSearchClick(true)}
                ></input>
              </div>
              <span className={styles.cancel} onClick={cancel}>
                取消
              </span>
            </div>
            <Divider />
          </div>

          <div
            className={styles.recentSearch}
            onClick={() => setSearchClick(false)}
          >
            <div className={styles.row}>
              <span className={styles.bolder}>最近搜索</span>
              <IconDelete onClick={del} />
            </div>
            {recentSearch.length === 0 ? (
              <Empty description="无最近搜索" />
            ) : (
              recentSearch.map((item) => {
                return (
                  <div
                    className={styles.row}
                    key={item}
                    onClick={() => up(item)}
                  >
                    <span>{item}</span>
                    <IconUp />
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
      {imgVisible ? <ShowPic /> : null}
      <AddPost />
      <PostPopup addPost={addPost} />
    </>
  )
}
