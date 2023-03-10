export interface IUser {
  _id: string
  // 账号
  account: string
  // 微信id
  wxId: string
  // 昵称
  nickname: string
  // 个人简介
  bio: string
  // 头像url
  avatar: string
  // 背景图url
  background: string
  // 创建时间
  createdAt: number
  follow: {
    followings: number // 关注数
    followeds: number // 粉丝数
  }
  status?: {
    isFollowed: boolean // 是否被你关注
    isFollowYou: boolean // 是否关注你
  }
}

export const EmptyUser: IUser = {
  _id: '',
  account: '',
  wxId: '',
  nickname: '',
  bio: '',
  avatar: '',
  background: '',
  createdAt: 0,
  follow: {
    followings: 0,
    followeds: 0,
  },
}

export interface ApiResp<T = any> {
  code: number
  message: string
  data: T
}

export enum PostList {
  posts = 1,
  photos,
  likes,
}

export interface IAddPost {
  // 帖子的类型，1 发帖 2 评论 3 转发
  type: number
  // 关联的 postId
  relativeId: string
  // 内容
  content: string
  // 图片 `url`列表
  images: string[]
}

export interface IRelativePost {
  user: {
    _id: string
    avatar: string
    nickname: string
    account: string
  }
  post: {
    _id: string
    type: number
    relativeId: string
    createdAt: number
    content: string
    images: string[]
    reposts: number
    comments: number
    likes: number
  }
  status: {
    isLiked: boolean // 是否被你喜欢
    isReposted: boolean // 是否被你转发
    isCommented: boolean // 是否被你评论
  }
}

export interface IPost {
  // 用户
  user: {
    _id: string
    avatar: string
    nickname: string
    account: string
  }
  post: {
    _id: string
    // 帖子类型 0 default, 1 comment, 2 repost
    type: number
    // 关联的帖子
    relativeId: string | null
    // 创建时间
    createdAt: number
    // 内容
    content: string
    // 图片 `url`列表
    images: string[]
    // 转发数
    reposts: number
    // 评论数
    comments: number
    // 喜欢数
    likes: number
  }
  relativePost: IRelativePost
  status: {
    isLiked: boolean // 是否被你喜欢
    isReposted: boolean // 是否被你转发
    isCommented: boolean // 是否被你评论
  }
}

export const EmptyRelativePost: IRelativePost = {
  user: {
    _id: '',
    avatar: '',
    nickname: '',
    account: '',
  },
  post: {
    _id: '',
    type: 0,
    relativeId: '',
    createdAt: 0,
    content: '',
    images: [],
    reposts: 0,
    comments: 0,
    likes: 0,
  },
  status: {
    isLiked: false,
    isReposted: false,
    isCommented: false,
  },
}

export const EmptyPost: IPost = {
  user: {
    _id: '',
    avatar: '',
    nickname: '',
    account: '',
  },
  post: {
    _id: '',
    type: 0,
    relativeId: null,
    createdAt: 0,
    content: '',
    images: [],
    reposts: 0,
    comments: 0,
    likes: 0,
  },
  relativePost: EmptyRelativePost,
  status: {
    isLiked: false,
    isReposted: false,
    isCommented: false,
  },
}

// 查询帖子参数
export interface IPostQuery {
  default: boolean
  repost: boolean
  comment: boolean
}

export interface IImgDownloadQuery {
  // 下载类型 `default` or `origin`，默认值`default`
  type?: string
  //  下载的图片url
  imgUrl: string
}

export interface ISearchUser {
  _id: string
  // 账号
  account: string // begin with `@`
  // 昵称
  nickname: string // from `wx`
  // 个人简介
  bio: string
  // 头像url
  avatar: string // url, from `wx`
  status: {
    isFollowed: boolean // 是否被你关注
    isFollowYou: boolean // 是否关注你
  }
}

// 通知模块
export interface INotice {
  _id: string
  userId: string
  fromId: string
  createdAt: number
  content: string
  readed: boolean // 是否已读
  from: {
    _id: string
    nickname: string
    avatar: string
  }
}

// wsMessage 模块

export enum ContentType {
  Text = 1,
  Image,
}

export interface IMessage {
  content: string
  contentType: ContentType // 文字或图片
  fromId: string
  toId: string
  _id?: string
  userId?: string
  readed?: boolean
  createdAt?: number
}

export interface IMsgInList {
  user: {
    _id: string
    avatar: string
    nickname: string
    account: string
  }
  status: {
    isFollowed: boolean // 是否被你关注
    isFollowYou: boolean // 是否关注你
    // createddAt: number,
  }
  message: {
    lastMsg: string
    createdAt: number
    unreadedNumber: number
  }
}
