import {ObjectId} from "mongodb";
import {OutputAutData} from "../types/authType";
import {usersMongooseModel} from "../db/mongooseSchema/mongooseSchema";

export const AuthQueryRepository = {
    async getUserData(userId: ObjectId):Promise<OutputAutData | null> {
        const user = await usersMongooseModel.findOne({_id: new ObjectId(userId)})
        if (!user) return null
        return {
            email: user.accountData.email,
            login: user.accountData.login,
            userId: user._id
        }
    },
}