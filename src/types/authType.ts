import {ObjectId} from "mongodb";

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