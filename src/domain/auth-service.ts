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
    DateIsNotValid = 6
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

        const update =  await usersRepository.updateConfirmationStatus(user._id)
        return {
            status: ResultStatus.Success,
            data: null
        }
    },
   /* async login(user: usersDBType): Promise<Result<null>> {


        /!*const user = await usersRepository.findUserByConfirmCode(code)
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
        }*!/

        const update =  await usersRepository.updateConfirmationStatus(user._id)
        return {
            status: ResultStatus.Success,
            data: null
        }
    },*/
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }
}