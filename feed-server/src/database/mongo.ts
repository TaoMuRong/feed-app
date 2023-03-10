import 'dotenv/config'
import { MongoClient, Db, Collection } from 'mongodb'
import {
  IFollow,
  ILike,
  IMessage,
  INotice,
  IPost,
  ISession,
  IUser,
} from '../models'

const uri = process.env.MONGO_URL
const client = new MongoClient(uri)
let db: Db
export let users: Collection<IUser>
export let sessions: Collection<ISession>
export let follows: Collection<IFollow>
export let posts: Collection<IPost>
export let likes: Collection<ILike>
export let notices: Collection<INotice>
export let messages: Collection<IMessage>
export async function init() {
  await client.connect()
  db = client.db()
  users = db.collection('user')
  sessions = db.collection('session')
  follows = db.collection('follow')
  posts = db.collection('post')
  likes = db.collection('like')
  notices = db.collection('notice')
  messages = db.collection('message')
}

export async function clear() { }

export async function close() { }
