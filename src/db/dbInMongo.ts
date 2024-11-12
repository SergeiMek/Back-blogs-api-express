import {SETTINGS} from "../settings";
import {MongoClient} from "mongodb";
import {blogsType, postType, usersDBType, videoType} from "./dbType";


export async function runDb(url: string) {
    let client = new MongoClient(url)
    let db = client.db(SETTINGS.DB_NAME)

    /// подключаем колекции
    /// videosCollection = db.

    try {
        await client.connect()
        await db.command({ping: 1})
        console.log('OK')
        return true
    } catch (e) {
        console.log(e)
        await client.close()
        return false
    }
}

export const client = new MongoClient(SETTINGS.MONGO_URL)

const db = client.db('blogsPlatform')
export const videosCollection = db.collection<videoType>('videos')
export const postsCollection = db.collection<postType>('posts')
export const blogsCollection = db.collection<blogsType>('blogs')
export const usersCollection = db.collection<usersDBType>('users')