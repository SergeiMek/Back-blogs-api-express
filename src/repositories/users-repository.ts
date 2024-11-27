import {usersCollection} from "../db/dbInMongo";
import {usersDBType} from "../db/dbType";
import {ObjectId, WithId} from "mongodb";


export const usersRepository = {

    async createdUser(newUserData: usersDBType): Promise<string> {

        const newUser = await usersCollection.insertOne(newUserData)
        return newUser.insertedId.toString()

    },
    async findUserByConfirmCode(code: string): Promise<usersDBType | null> {
        return await usersCollection.findOne({'emailConfirmation.confirmationCode': code})

    },
    async updateConfirmationCode(_id: ObjectId, code: string): Promise<boolean> {
        let result = await usersCollection.updateOne({_id}, {$set: {'emailConfirmation.confirmationCode': code}})
        return result.matchedCount === 1
    },
    async findUserById(id: ObjectId): Promise<usersDBType | null> {
        const user = await usersCollection.findOne({_id: id})
        if (!user) return null
        return user
    },
    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<usersDBType> | null> {
        return await usersCollection.findOne({
            $or: [{'accountData.email': loginOrEmail}, {'accountData.login': loginOrEmail}],
        });
    },
    async deleteUser(id: string): Promise<boolean> {

        if (!this._checkObjectId(id)) return false;
        const isDel = await usersCollection.deleteOne({_id: new ObjectId(id)})
        return isDel.deletedCount === 1;
    },
    async updateConfirmationStatus(_id: ObjectId): Promise<boolean> {
        let result = await usersCollection.updateOne({_id}, {$set: {'emailConfirmation.isConfirmed': true}})
        return result.matchedCount === 1
    },
    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }
}