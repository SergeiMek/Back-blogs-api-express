import {usersDBType} from "../db/dbType";
import {ObjectId, WithId} from "mongodb";
import {usersMongooseModel} from "../db/mongooseSchema/mongooseSchema";


export const usersRepository = {

    async createdUser(newUserData: usersDBType): Promise<string> {

        /*const newUser = await usersCollection.insertOne(newUserData)
        return newUser.insertedId.toString()*/
        const newUser = await usersMongooseModel.create(newUserData)
        return newUser._id.toString()

    },
    async findUserByConfirmCode(code: string): Promise<usersDBType | null> {
        ///return await usersCollection.findOne({'emailConfirmation.confirmationCode': code})
        return usersMongooseModel.findOne({'emailConfirmation.confirmationCode': code})
    },
    async updateConfirmationCode(_id: ObjectId, code: string): Promise<boolean> {
        let result = await usersMongooseModel.updateOne({_id}, {$set: {'emailConfirmation.confirmationCode': code}})
        return result.matchedCount === 1
    },
    async findUserById(id: ObjectId): Promise<usersDBType | null> {
        const user = await usersMongooseModel.findOne({_id: id})
        if (!user) return null
        return user
    },
    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<usersDBType> | null> {
        return usersMongooseModel.findOne({
            $or: [{'accountData.email': loginOrEmail}, {'accountData.login': loginOrEmail}],
        });
    },
    async deleteUser(id: string): Promise<boolean> {
        if (!this._checkObjectId(id)) return false;
        const userInstance = await usersMongooseModel.findOne({_id: new ObjectId(id)})
        if (!userInstance) return false
        await userInstance.deleteOne()
        return true
        /*const isDel = await usersMongooseModel.deleteOne({_id: new ObjectId(id)})
        return isDel.deletedCount === 1;*/
    },
    async updateConfirmationStatus(_id: ObjectId): Promise<boolean> {
        let result = await usersMongooseModel.updateOne({_id}, {$set: {'emailConfirmation.isConfirmed': true}})
        return result.matchedCount === 1
    },
    async updatePasswordRecoveryData(_id: ObjectId, expirationDate: Date, recoveryCode: string): Promise<boolean> {
        const userInstance = await usersMongooseModel.findOne({_id})
        if (!userInstance) return false
        userInstance.passwordRecovery.recoveryCode = recoveryCode
        userInstance.passwordRecovery.expirationDate = expirationDate
        await userInstance.save()
        return true
    },
    async findUserByPasswordRecoveryCode(recoveryCode: string): Promise<usersDBType | null> {
        return usersMongooseModel.findOne({'passwordRecovery.recoveryCode':recoveryCode})
    },
    async updatePassword(_id: ObjectId, passwordSold: string, passwordHash: string): Promise<boolean> {
        const userInstance = await usersMongooseModel.findOne({_id})
        if (!userInstance) return false
        userInstance.accountData.passwordHash = passwordHash
        userInstance.accountData.passwordSalt = passwordSold
        userInstance.passwordRecovery.expirationDate = null
        userInstance.passwordRecovery.recoveryCode = null
        userInstance.save()
        return true
    },
    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }
}