import {SETTINGS} from "../settings";
import {Db, MongoClient} from "mongodb";
import {blogsType, postType, usersDBType, videoType} from "./dbType";
import {deleteDB} from "./db";


export const dbMongo = {
    client: {} as MongoClient,

    getDbName(): Db {
        return this.client.db(SETTINGS.DB_NAME);
    },
    async run(url: string) {
        try {
            this.client = new MongoClient(url)
            await this.client.connect();
            await this.getDbName().command({ping: 1});
            console.log("Connected successfully to mongo server");
            return true
        } catch (e: unknown) {
            console.error("Can't connect to mongo server", e);
            await this.client.close();

            return false
        }

    },
    async stop() {
        await this.client.close();
        console.log("Connection successful closed");
    },
    async drop() {
        try {
            //await this.getDbName().dropDatabase()
            const collections = await this.getDbName().listCollections().toArray();
            for (const collection of collections) {
                const collectionName = collection.name;
                await this.getDbName().collection(collectionName).deleteMany({});
            }
            await deleteDB()
        } catch (e: unknown) {
            console.error('Error in drop db:', e);
            await this.stop();
        }
    }

}

/*export async function runDb(url: string) {
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
}*/


export const client = new MongoClient(SETTINGS.MONGO_URL)

const db = client.db('blogsPlatform')
export const videosCollection = db.collection<videoType>('videos')
export const postsCollection = db.collection<postType>('posts')
export const blogsCollection = db.collection<blogsType>('blogs')
export const usersCollection = db.collection<usersDBType>('users')