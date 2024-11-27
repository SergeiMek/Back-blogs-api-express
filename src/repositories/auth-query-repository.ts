import {ObjectId} from "mongodb";
import {usersCollection} from "../db/dbInMongo";
import {OutputAutData} from "../types/authType";

export const AuthQueryRepository = {
    async getUserData(userId: ObjectId):Promise<OutputAutData | null> {
        const user = await usersCollection.findOne({_id: new ObjectId(userId)})
        if (!user) return null
        return {
            email: user.accountData.email,
            login: user.accountData.login,
            userId: user._id
        }
    },
}