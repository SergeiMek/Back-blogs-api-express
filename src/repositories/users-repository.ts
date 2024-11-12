import {usersCollection} from "../db/dbInMongo";
import {usersDBType} from "../db/dbType";
import {ObjectId, WithId} from "mongodb";


export const usersRepository = {

    async createdUser(newUserData: usersDBType): Promise<string> {

        const newUser = await usersCollection.insertOne(newUserData)
        return newUser.insertedId.toString()

    },
    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<usersDBType> | null> {
        return usersCollection.findOne({
            $or: [{email: loginOrEmail}, {login: loginOrEmail}],
        });

    },
    async deleteUser(id: string): Promise<boolean> {

        if (!this._checkObjectId(id)) return false;
        const isDel = await usersCollection.deleteOne({_id: new ObjectId(id)})
        debugger
        return isDel.deletedCount === 1;
    },
    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }
}