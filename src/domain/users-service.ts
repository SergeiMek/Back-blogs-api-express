import {usersDBType} from "../db/dbType";
import {userInputType} from "../types/usersType";
import bcrypt from "bcrypt"
import {ObjectId} from "mongodb";
import {UsersRepository} from "../repositories/users-repository";
import {AccountData, AuthDBTypeClass, EmailConfirmation, PasswordRecovery} from "../types/authType";


export class UsersService {

  private usersRepository: UsersRepository

    constructor() {
        this.usersRepository = new UsersRepository()
    }

    async createdUser(userCreatedData: userInputType): Promise<string> {

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(userCreatedData.password, passwordSalt)


        const newUser: usersDBType = new AuthDBTypeClass(new ObjectId(),
            new AccountData(new Date().toISOString(), userCreatedData.login, userCreatedData.email, passwordHash, passwordSalt),
            new EmailConfirmation(null, null, true),
            new PasswordRecovery(null, null)
        )

        return this.usersRepository.createdUser(newUser)
    }

    async checkCredentials(loginOrEmail: string, password: string): Promise<usersDBType | null> {
        //// проверить на подтвержденный код
        const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) return null
        const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)
        if (user.accountData.passwordHash !== passwordHash) {
            return null
        }
        return user
    }

    async deleteUser(id: string): Promise<boolean> {
        return await this.usersRepository.deleteUser(id)
    }

    async findUserById(id: ObjectId): Promise<null | usersDBType> {
        return await this.usersRepository.findUserById(id)
    }

    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }
}

