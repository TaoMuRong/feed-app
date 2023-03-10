import { ObjectId, WithId } from 'mongodb'
import { likes, posts, users, follows } from '../database/mongo'
import { stats } from '../lib/stats'
import { ILike, IPost, PostType } from '../models'
import { PostDTO, PostStatus, PostUser, userToPostUser } from '../models/post'

/**
 * 发帖评论和转发
 * @param userId
 * @param type
 * @param relativeId
 * @param content
 * @param images
 */
export async function createPost(
  userId: string,
  type: PostType,
  relativeId: string,
  content: string,
  images: string[]
) {
  const post: IPost = {
    comments: 0,
    content: content,
    createdAt: Date.now(),
    images: images,
    isDeleted: false,
    likes: 0,
    relativeId:
      !!relativeId && relativeId !== '' ? new ObjectId(relativeId) : null,
    reposts: 0,
    type: type,
    userId: new ObjectId(userId),
  }

  // 为relative的post增加转发数or评论数
  switch (type) {
    case PostType.Comment:
      await posts.updateOne(
        { _id: new ObjectId(relativeId) },
        { $inc: { comments: 1 } }
      )
      break
    case PostType.Repost:
      await posts.updateOne(
        { _id: new ObjectId(relativeId) },
        { $inc: { reposts: 1 } }
      )
      break
    case PostType.Default:
      break
  }

  const insertRes = await posts.insertOne(post)
  return {
    ok: insertRes.acknowledged,
    postId: insertRes.insertedId,
  }
}

export async function listPost(
  userId: string,
  options: {
    default_: boolean
    repost: boolean
    comment: boolean
    prev?: string
    next?: string
    limit?: number
  }
): Promise<WithId<IPost>[]> {
  const limit = options.limit || 10
  let postsList: WithId<IPost>[] = []
  const orList = []
  const followedIdList = [{ userId: new ObjectId(userId) }]
  if (options.default_) orList.push({ type: PostType.Default })
  if (options.repost) orList.push({ type: PostType.Repost })
  if (options.comment) orList.push({ type: PostType.Comment })

  const followUsers = await follows
    .find({ userId: new ObjectId(userId) })
    .toArray()
  followUsers.forEach((item) => {
    followedIdList.push({ userId: item.followedId })
  })

  if (options.next) {
    postsList = await posts
      .find({
        $or: followedIdList,
        $and: [{ type: { $ne: 2 } }],
        _id: {
          $lt: new ObjectId(options.next),
        },
      })
      .sort({ _id: -1 })
      .limit(limit)
      .toArray()
  } else if (options.prev) {
    postsList = await posts
      .find({
        $or: followedIdList,
        $and: [{ type: { $ne: 2 } }],
        _id: {
          $gt: new ObjectId(options.prev),
        },
      })
      .sort({ _id: -1 })
      .limit(limit)
      .toArray()
    postsList.reverse()
  } else {
    postsList = await posts
      .find({
        $or: followedIdList,
        $and: [{ type: { $ne: 2 } }],
      })
      .sort({ _id: -1 })
      .limit(limit)
      .toArray()
  }

  return postsList
}

export async function listPostWithUserAndStatus(
  userId: string,
  options: {
    default_: boolean
    repost: boolean
    comment: boolean
    prev?: string
    next?: string
    limit?: number
  }
): Promise<{ user: PostUser; post: PostDTO; status: PostStatus }[]> {
  const postList = await listPost(userId, options)

  return await postsWithUserAndStatus(postList, userId)
}

export async function listUserPostWithUserAndStatus(
  userId: string,
  hasImage: boolean
) {
  let query
  if (!hasImage)
    query = { userId: new ObjectId(userId), type: PostType.Default }
  if (hasImage)
    query = {
      userId: new ObjectId(userId),
      type: PostType.Default,
      $where: 'this.images.length > 0',
    }
  const postList = await posts.find(query).toArray()
  postList.reverse()

  return postsWithUserAndStatus(postList, userId)
}

export async function listLikePostWithUserAndStatus(
  userId: string
): Promise<{ user: PostUser; post: PostDTO; status: PostStatus }[]> {
  const postIds = await likes
    .find({ userId: new ObjectId(userId) })
    .project<{ postId: string }>({ _id: 0, postId: 1 })
    .toArray()
    .then((postList) => postList.map((i) => i.postId))
  const postList = (await posts
    .aggregate([{ $match: { _id: { $in: postIds } } }])
    .toArray()) as WithId<IPost>[]

  postList.reverse()
  return postsWithUserAndStatus(postList, userId)
}

export async function listCommentsWithUserAndStatus(
  postId: string,
  userId: string
) {
  const postList = await posts
    .find({ relativeId: new ObjectId(postId), type: PostType.Comment })
    .toArray()
  return postsWithUserAndStatus(postList, userId)
}

async function postsWithUserAndStatus(
  postList: WithId<IPost>[],
  userId: string
) {
  const resList: {
    user: PostUser
    post: PostDTO
    status: PostStatus
    relativePost: { user: PostUser; post: PostDTO }
  }[] = []

  for (let post of postList) {
    let relativePost = { user: {} as PostUser, post: {} as PostDTO }
    const postId = post._id
    const postUserId = post.userId
    const user = await users.findOne({ _id: postUserId })
    const postUser = userToPostUser(user)
    const status: PostStatus = {
      isCommented: !!(await posts.findOne({
        userId: new ObjectId(userId),
        relativeId: postId,
        type: PostType.Comment,
      })),
      isLiked: !!(await likes.findOne({
        userId: new ObjectId(userId),
        postId: postId,
      })),
      isReposted: !!(await posts.findOne({
        userId: new ObjectId(userId),
        relativeId: postId,
        type: PostType.Repost,
      })),
    }
    if (post.relativeId) {
      const relativePostPost = await posts.findOne({ _id: post.relativeId })
      if (relativePostPost) {
        const relativeUser = await users.findOne({
          _id: relativePostPost.userId,
        })
        const postRelativeUser = userToPostUser(relativeUser)
        relativePost.post = relativePostPost as PostDTO
        relativePost.user = postRelativeUser
      }
    }

    resList.push({
      post: post as PostDTO,
      status: status,
      user: postUser,
      relativePost: relativePost,
    })
  }
  return resList
}

export async function getPostWithUserAndStatus(postId: string) {
  const post = await posts.findOne({ _id: new ObjectId(postId) })
  if (post) {
    const userId = post.userId.toString()

    const user = await users.findOne({ _id: new ObjectId(userId) })
    const postUser = userToPostUser(user)

    const status: PostStatus = {
      isCommented: !!(await posts.findOne({
        userId: new ObjectId(userId),
        relativeId: new ObjectId(postId),
        type: PostType.Comment,
      })),
      isLiked: !!(await likes.findOne({
        userId: new ObjectId(userId),
        postId: new ObjectId(postId),
      })),
      isReposted: !!(await posts.findOne({
        userId: new ObjectId(userId),
        relativeId: new ObjectId(postId),
        type: PostType.Repost,
      })),
    }
    return {
      post,
      status,
      user: postUser,
    }
  } else throw stats.ErrorPostNotFound
}

export async function createLike(userId: string, postId: string) {
  const like: ILike = {
    createAt: Date.now(),
    postId: new ObjectId(postId),
    userId: new ObjectId(userId),
  }

  if (
    !!(await likes.findOne({
      userId: new ObjectId(userId),
      postId: new ObjectId(postId),
    }))
  )
    return {
      ok: true,
      msg: '您已收藏',
    }
  const res = await likes.insertOne(like)
  // 为被喜欢的帖子增加like数
  await posts.updateOne({ _id: new ObjectId(postId) }, { $inc: { likes: 1 } })
  return {
    ok: res.acknowledged,
    insertId: res.insertedId,
  }
}

export async function cancelLike(userId: string, postId: string) {
  const deleteRes = await likes.deleteOne({
    userId: new ObjectId(userId),
    postId: new ObjectId(postId),
  })
  if (deleteRes.acknowledged) {
    await posts.updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { likes: -1 } }
    )
  }
  return {
    ok: true,
  }
}

export async function getPostAuthorId(postId: string) {
  const post = await posts.findOne({ _id: new ObjectId(postId) })
  return post.userId.toString()
}

export async function rmPostByPostId(postId: string) {
  const res = await posts.findOneAndDelete({ _id: new ObjectId(postId) })
  if (res.ok === 1) {
    // 删除评论
    await posts.deleteMany({
      relativeId: res.value._id,
      type: PostType.Comment,
    })
  }
  return {
    ok: res.ok,
  }
}
