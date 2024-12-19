import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid/dist/esm";
import {add} from "date-fns/index";
import {usersDBType} from "../db/dbType";

export type authInputType = {
    loginOrEmail: string
    password: string
}
export type OutputAutData = {
    email: string
    login: string
    userId: ObjectId
}

export type registrationDataType = {
    login: string
    password: string
    email: string
}

export type recoveryPasswordBodyType = {
    newPassword: string
    recoveryCode: string

}


export class AccountData {
    constructor(
        public createdAt: string,
        public login: string,
        public email: string,
        public passwordHash: string,
        public passwordSalt: string
    ) {
    }
}

export class EmailConfirmation {
    constructor(
        public confirmationCode: string | null,
        public expirationData: Date | null,
        public isConfirmed: boolean,
    ) {
    }
}

export class PasswordRecovery {
    constructor(
        public recoveryCode: string | null,
        public expirationDate: Date | null,
    ) {
    }
}

export class AuthDBTypeClass {
    constructor(
        public _id =  new ObjectId,
        public accountData: AccountData,
        public emailConfirmation: EmailConfirmation,
        public passwordRecovery: PasswordRecovery
    ) {
    }
}