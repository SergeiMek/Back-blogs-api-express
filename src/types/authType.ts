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