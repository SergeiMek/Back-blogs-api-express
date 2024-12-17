import {registrationDataType} from "../types/authType";
import bcrypt from "bcrypt";
import {usersDBType} from "../db/dbType";
import {ObjectId} from "mongodb";
import {add} from "date-fns";
import {emailManager} from "../adapters/email-manager";
import {usersRepository} from "../repositories/users-repository";
import {v4 as uuidv4} from 'uuid';
import {usersService} from "./users-service";


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


export const authService = {
    async registerUser(registerData: registrationDataType): Promise<Result<null>> {

        const findUserByLogin = await usersRepository.findByLoginOrEmail(registerData.login)
        const findUserByEmail = await usersRepository.findByLoginOrEmail(registerData.email)

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


        const newUser: usersDBType = {
            _id: new ObjectId(),
            accountData: {
                createdAt: new Date().toISOString(),
                login: registerData.login,
                email: registerData.email,
                passwordHash,
                passwordSalt
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationData: add(new Date(), {hours: 1}),  //// v   add(new Date(), {hours: 1})
                isConfirmed: false
            },
            passwordRecovery: {
                expirationDate: null,
                recoveryCode: null
            }
        }

        const createResult = await usersRepository.createdUser(newUser)

        try {
            await emailManager.sendRegistrationEmail(
                newUser.accountData.email,
                newUser.emailConfirmation.confirmationCode!
            );
        } catch (error) {
            console.error(error);
            await usersRepository.deleteUser(newUser._id.toString())
            return {
                status: ResultStatus.ErrorMessage,
                data: null
            };
        }

        return {
            status: ResultStatus.Success,
            data: null
        }

    },
    async resendConfirmationCode(email: string): Promise<Result<null>> {
        const user = await usersRepository.findByLoginOrEmail(email)
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
        const updated = await usersRepository.updateConfirmationCode(user._id, newConfirmationCode)
        return {
            status: ResultStatus.Success,
            data: null
        }
    },
    async confirmEmail(code: string): Promise<Result<null>> {
        const user = await usersRepository.findUserByConfirmCode(code)
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

        const update = await usersRepository.updateConfirmationStatus(user._id)
        return {
            status: ResultStatus.Success,
            data: null
        }
    },
    async sendPasswordRecoveryCode(email: string): Promise<Result<null>> {
        const user = await usersRepository.findByLoginOrEmail(email)
        if (!user) return {
            status: ResultStatus.NotUser,
            data: null
        }
        const userId = user._id
        const recoveryCode = uuidv4()
        const expirationDate = add(new Date(), {hours: 1})

        try {
            await emailManager.sendRegistrationEmail(
                user.accountData.email,
                recoveryCode
            );
        } catch (error) {
            console.error(error);
            return {
                status: ResultStatus.ErrorMessage,
                data: null
            }
        }
        const result = await usersRepository.updatePasswordRecoveryData(userId, expirationDate, recoveryCode)

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
    },
    async changePassword(recoveryCode: string, password: string): Promise<Result<null>> {
        const user = await this.findUserByPasswordRecoveryCode(recoveryCode)
        if (!user) return {
            status: ResultStatus.NotUser,
            data: null
        }

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(password, passwordSalt)

        const result = await usersRepository.updatePassword(user._id,passwordSalt,passwordHash)

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
    },
    async findUserByPasswordRecoveryCode(recoveryCode: string): Promise<usersDBType | null> {
        return await usersRepository.findUserByPasswordRecoveryCode(recoveryCode)

    },
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }
}