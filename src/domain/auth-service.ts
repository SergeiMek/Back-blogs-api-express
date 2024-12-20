import {
    AccountData,
    AuthDBTypeClass,
    EmailConfirmation,
    PasswordRecovery,
    registrationDataType
} from "../types/authType";
import bcrypt from "bcrypt";
import {usersDBType} from "../db/dbType";
import {ObjectId} from "mongodb";
import {add} from "date-fns";
import {emailManager} from "../adapters/email-manager";
import {v4 as uuidv4} from 'uuid';
import {UsersRepository} from "../repositories/users-repository";


enum ResultStatus {
    Success = 0,
    NotCorrectEmail = 1,
    NotCorrectLogin = 2,
    ErrorMessage = 3,
    NotUser = 4,
    CodeConfirmed = 5,
    DateIsNotValid = 6,
    ServerError = 7
}

type Result<T> = {
    status: ResultStatus
    errorMessage?: string
    data: T
}


export class AuthService {

    private usersRepository: UsersRepository

    constructor() {
        this.usersRepository = new UsersRepository()
    }
    async registerUser(registerData: registrationDataType): Promise<Result<null>> {

        const findUserByLogin = await this.usersRepository.findByLoginOrEmail(registerData.login)
        const findUserByEmail = await this.usersRepository.findByLoginOrEmail(registerData.email)

        if (findUserByEmail) {
            return {
                status: ResultStatus.NotCorrectEmail,
                data: null
            }
        }
        if (findUserByLogin) {
            return {
                status: ResultStatus.NotCorrectLogin,
                data: null
            }
        }


        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(registerData.password, passwordSalt)


        const newUser: usersDBType = new AuthDBTypeClass( new ObjectId(),
            new AccountData(new Date().toISOString(),registerData.login,registerData.email,passwordHash,passwordSalt),
            new EmailConfirmation(uuidv4(),add(new Date(), {hours: 1}),false),
            new PasswordRecovery(null,null)
            )

        const createResult = await this.usersRepository.createdUser(newUser)

        try {
            await emailManager.sendRegistrationEmail(
                newUser.accountData.email,
                newUser.emailConfirmation.confirmationCode!
            );
        } catch (error) {
            console.error(error);
            await this.usersRepository.deleteUser(newUser._id.toString())
            return {
                status: ResultStatus.ErrorMessage,
                data: null
            };
        }

        return {
            status: ResultStatus.Success,
            data: null
        }

    }

    async resendConfirmationCode(email: string): Promise<Result<null>> {
        const user = await this.usersRepository.findByLoginOrEmail(email)
        if (!user) return {
            status: ResultStatus.NotUser,
            data: null
        }
        if (user.emailConfirmation.isConfirmed) return {
            status: ResultStatus.CodeConfirmed,
            data: null
        }
        const newConfirmationCode = uuidv4()
        try {
            await emailManager.sendRegistrationEmail(
                user.accountData.email,
                newConfirmationCode
            );
        } catch (error) {
            console.error(error);
            return {
                status: ResultStatus.ErrorMessage,
                data: null
            }
        }
        const updated = await this.usersRepository.updateConfirmationCode(user._id, newConfirmationCode)
        return {
            status: ResultStatus.Success,
            data: null
        }
    }

    async confirmEmail(code: string): Promise<Result<null>> {
        const user = await this.usersRepository.findUserByConfirmCode(code)
        if (!user) return {
            status: ResultStatus.NotUser,
            data: null
        }
        if (user.emailConfirmation.isConfirmed) return {
            status: ResultStatus.CodeConfirmed,
            data: null
        }
        if (user.emailConfirmation.expirationData! < new Date()) return {
            status: ResultStatus.DateIsNotValid,
            data: null
        }

        const update = await this.usersRepository.updateConfirmationStatus(user._id)
        return {
            status: ResultStatus.Success,
            data: null
        }
    }

    async sendPasswordRecoveryCode(email: string): Promise<Result<null>> {
        const user = await this.usersRepository.findByLoginOrEmail(email)
        if (!user) return {
            status: ResultStatus.NotUser,
            data: null
        }
        const userId = user._id
        const recoveryCode = uuidv4()
        const expirationDate = add(new Date(), {hours: 1})

        try {
            await emailManager.sendChangePasswordEmail(
                user.accountData.email,
                recoveryCode
            );
        } catch (error) {
            // console.error(error);
            return {
                status: ResultStatus.ErrorMessage,
                data: null
            }
        }
        const result = await this.usersRepository.updatePasswordRecoveryData(userId, expirationDate, recoveryCode)

        if (!result) {
            return {
                status: ResultStatus.ServerError,
                data: null
            }
        }

        return {
            status: ResultStatus.Success,
            data: null
        }
    }

    async changePassword(recoveryCode: string, password: string): Promise<Result<null>> {
        const user = await this.findUserByPasswordRecoveryCode(recoveryCode)
        if (!user) return {
            status: ResultStatus.NotUser,
            data: null
        }

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(password, passwordSalt)

        const result = await this.usersRepository.updatePassword(user._id, passwordSalt, passwordHash)

        if (!result) {
            return {
                status: ResultStatus.ServerError,
                data: null
            }
        }

        return {
            status: ResultStatus.Success,
            data: null
        }
    }

    async findUserByPasswordRecoveryCode(recoveryCode: string): Promise<usersDBType | null> {
        return await this.usersRepository.findUserByPasswordRecoveryCode(recoveryCode)

    }

    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }

}


