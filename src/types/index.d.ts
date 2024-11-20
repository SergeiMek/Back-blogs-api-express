import {usersDBType} from "../db/dbType";

declare global {
    declare namespace Express {
        export interface Request {
            user: usersDBType | null
        }
    }
}