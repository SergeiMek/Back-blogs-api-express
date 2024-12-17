import {SETTINGS} from "../settings";
import {Db, MongoClient} from "mongodb";


const dbMongo = {
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
            //await deleteDB()
        } catch (e: unknown) {
            console.error('Error in drop db:', e);
            await this.stop();
        }
    }

}


 const client = new MongoClient(SETTINGS.MONGO_URL)

const db = client.db('blogsPlatform')


