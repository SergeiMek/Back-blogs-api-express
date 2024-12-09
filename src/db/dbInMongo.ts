import {SETTINGS} from "../settings";
import {Db, MongoClient} from "mongodb";
import {
    blackListType,
    blogsType,
    commentsDBType,
    deviceDBType,
    postType, rateLimitType,
    usersDBType,
    videoType
} from "./dbType";
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


export const client = new MongoClient(SETTINGS.MONGO_URL)

const db = client.db('blogsPlatform')
export const videosCollection = db.collection<videoType>('videos')
export const postsCollection = db.collection<postType>('posts')
export const blogsCollection = db.collection<blogsType>('blogs')
export const usersCollection = db.collection<usersDBType>('users')
export const commentsCollection = db.collection<commentsDBType>('comments')
export const deviceCollection = db.collection<deviceDBType>('device')
export const limitCollection = db.collection<rateLimitType>('limit')


