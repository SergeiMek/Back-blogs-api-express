import {usersDBType} from "../db/dbType";
import jwt, {JwtPayload} from "jsonwebtoken"
import {SETTINGS} from "../settings";
import {ObjectId} from "mongodb";

export const jwtService = {
    async createJWT(user: usersDBType) {
        return jwt.sign({userId: user._id}, SETTINGS.JWT_SECRET, {expiresIn: '5h'})
    },
    async getUserIdByToken(token: string) {
        try {
            const result = jwt.verify(token, SETTINGS.JWT_SECRET) as { userId: string }
            return new ObjectId(result.userId)
        } catch (error) {
            return null
        }

    }
}