import {usersDBType} from "../db/dbType";
import jwt from "jsonwebtoken"
import {SETTINGS} from "../settings";
import {ObjectId} from "mongodb";
import {v4 as uuidv4} from 'uuid';

export const jwtService = {
    async createAccessTokenJWT(user: usersDBType, deviceId: string = uuidv4()) {
        return jwt.sign({userId: user._id, deviceId}, SETTINGS.JWT_SECRET, {expiresIn: '10s'})
    },
    async createRefreshTokenJWT(user: usersDBType, deviceId: string = uuidv4()) {
        return  jwt.sign({userId: user._id, deviceId}, SETTINGS.JWT_SECRET, {expiresIn: '20s'})
    },
    async getUserIdByToken(token: string) {
        try {
            const result = jwt.verify(token, SETTINGS.JWT_SECRET) as { userId: string, deviceId: string }
            return new ObjectId(result.userId)
        } catch (error) {
            return null
        }
    },
    async verifyToken(token: string) {
        try {
            return jwt.verify(token, SETTINGS.JWT_SECRET) as {
                userId: string;
                deviceId: string;
                iat: number;
                exp: number;
            };
        } catch (error) {
            return null;
        }
    }
}
