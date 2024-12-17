import {SETTINGS} from "../settings";
import * as mongoose from "mongoose";



   export async function runDbMongoose(url: string) {
        try {
            await mongoose.connect(url + '/' + SETTINGS.DB_NAME)
            console.log("Connected successfully to mongo server");
            return true
        } catch (e: unknown) {
            console.error("Can't connect to mongo server", e);
            await mongoose.disconnect()
            return false
        }

    }


