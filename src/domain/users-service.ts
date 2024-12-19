import {usersDBType} from "../db/dbType";
import {userInputType} from "../types/usersType";
import bcrypt from "bcrypt"
import {ObjectId} from "mongodb";
import {usersRepository} from "../repositories/users-repository";
import {AccountData, AuthDBTypeClass, EmailConfirmation, PasswordRecovery} from "../types/authType";
import {v4 as uuidv4} from "uuid/dist/esm";
import {add} from "date-fns";


export const usersService = {

    async createdUser(userCreatedData: userInputType): Promise<string> {

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(userCreatedData.password, passwordSalt)


        /*const newUser: usersDBType = {
            _id: new ObjectId(),
            accountData: {
                createdAt: new Date().toISOString(),
                login: userCreatedData.login,
                email: userCreatedData.email,
                passwordHash,
                passwordSalt
            },
            emailConfirmation: {
                confirmationCode: null,
                expirationData: null,
                isConfirmed: true
            },
            passwordRecovery: {
                expirationDate: null,
                recoveryCode: null
            }
        }*/

        const newUser: usersDBType = new AuthDBTypeClass(new ObjectId(),
            new AccountData(new Date().toISOString(), userCreatedData.login, userCreatedData.email, passwordHash, passwordSalt),
            new EmailConfirmation(null, null, true),
            new PasswordRecovery(null, null)
        )

        return usersRepository.createdUser(newUser)
    },
    async checkCredentials(loginOrEmail: string, password: string): Promise<usersDBType | null> {
        //// проверить на подтвержденный код
        const user = await usersRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) return null
        const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)
        if (user.accountData.passwordHash !== passwordHash) {
            return null
        }
        return user
    },
    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id)
    },
    async findUserById(id: ObjectId): Promise<null | usersDBType> {
        return await usersRepository.findUserById(id)
    },
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }

}