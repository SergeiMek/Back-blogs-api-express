import {postDBType, postType, usersDBType} from "../db/dbType";
import {userInputType, usersEntityType} from "../types/usersType";
import bcrypt from "bcrypt"
import {ObjectId} from "mongodb";
import {usersRepository} from "../repositories/users-repository";
import {usersRouter} from "../routes/users-router";


export const usersService = {

    async createdUser(userCreatedData: userInputType): Promise<string> {

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(userCreatedData.password, passwordSalt)


        const newUser: usersDBType = {
            _id: new ObjectId(),
            createdAt: new Date().toISOString(),
            login: userCreatedData.login,
            email: userCreatedData.email,
            passwordHash,
            passwordSalt
        }

        return usersRepository.createdUser(newUser)
    },
    async checkCredentials(loginOrEmail: string, password: string): Promise<usersDBType | null> {
        const user = await usersRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) return null
        const passwordHash = await this._generateHash(password, user.passwordSalt)
        if (user.passwordHash !== passwordHash) {
            return null
        }
        return user
    },
    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id)
    },
    async findUserById(id: ObjectId):Promise<null | usersDBType> {
        return await usersRepository.findUserById(id)
    },
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }

}