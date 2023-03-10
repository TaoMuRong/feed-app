import { follows, likes, posts, users } from '../database/mongo'
import { ObjectId } from 'mongodb'
import { getUserInfo } from './userService'
import { PostDTO, PostStatus, PostUser } from '../models/post'
import { stats } from '../lib/stats'

/**
 * 为每一个查找出来的user吗，添加一个state，包含是非被你关注和是否关注你
 * @param userId
 * @param words
 */
export async function searchUserWithStatus(userId: string, words: string) {
  const userList = await searchUser(words)
  for (let user of userList) {
    user.status = {
      // 是否被你关注
      isFollowed: !!(await follows.findOne({
        userId: new ObjectId(userId),
        followedId: new ObjectId(user._id),
      })),
      // 是否关注你
      isFollowYou: !!(await follows.findOne({
        userId: new ObjectId(user._id),
        followedId: new ObjectId(userId),
      })),
    }
  }
  return userList
}

export async function searchPostWithUserAndStatus(
  userId: string,
  words: string,
  hasImage: boolean
): Promise<{ user: PostUser; post: PostDTO; status: PostStatus }[]> {
  const postWithUserAndStatusList: {
    user: PostUser
    post: PostDTO
    status: PostStatus
  }[] = []
  const postList = await searchPost(words, hasImage)
  for (let post of postList) {
    const userInfo = await getUserInfo(post.userId.toString())
    if (!userInfo) break
    const user: PostUser = {
      _id: userInfo._id,
      avatar: userInfo.avatar,
      nickname: userInfo.nickname,
      account: userInfo.account,
    }
    const status: PostStatus = {
      // 是否被你喜欢
      isLiked: !!(await likes.findOne({
        userId: new ObjectId(userId),
        postId: post._id,
      })),
      // 是否被你转发
      isReposted: !!(await posts.findOne({
        userId: new ObjectId(userId),
        type: 2,
        relativeId: post._id,
      })),
      // 是否被你评论
      isCommented: !!(await posts.findOne({
        userId: new ObjectId(userId),
        type: 3,
        relativeId: post._id,
      })),
    }
    const postDTO: PostDTO = post as PostDTO
    postWithUserAndStatusList.push({
      user,
      post: postDTO,
      status,
    })
  }
  return postWithUserAndStatusList
}

export async function searchUser(words: string) {
  words = words.trim()
  const query = {
    $or: [{ nickname: { $regex: words } }, { bio: { $regex: words } }],
  }
  const projection = { _id: 1, account: 1, nickname: 1, bio: 1, avatar: 1 }
  try {
    const userList = await users.find(query).project(projection).toArray()
    return userList
  } catch (err) {
    throw stats.ErrorSearch
  }
}

export async function searchPost(words: string, hasImage: boolean) {
  let query
  if (!hasImage) query = { content: { $regex: words } }
  if (hasImage)
    query = { content: { $regex: words }, $where: 'this.images.length > 0' }

  try {
    const postList = await posts.find(query).toArray()
    return postList
  } catch (err) {
    throw stats.ErrorSearch
  }
}
