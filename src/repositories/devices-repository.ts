import {blackListType, deviceDBType, usersDBType} from "../db/dbType";
import {v4 as uuidv4} from "uuid/dist/esm";
import jwt from "jsonwebtoken";
import {SETTINGS} from "../settings";
import {ObjectId, WithId} from "mongodb";
import {DeviceViewModel} from "../types/diviceType";
import {jwtService} from "../application/jwtService";
import {blackListCollection, deviceCollection} from "../db/dbInMongo";

export const devicesRepository = {
    async createDevice(deviceDara: deviceDBType): Promise<ObjectId> {
        const result = await deviceCollection.insertOne(deviceDara)
        return result.insertedId
    },
    async deleteDevice(id: string): Promise<boolean> {
        const result = await deviceCollection.deleteOne({deviceId: id})
        return result.deletedCount === 1
    },
    async findDeviceById(deviceId: string): Promise<deviceDBType | null> {
        return await deviceCollection.findOne({deviceId})
    },
    async updateDevice(ip: string, userId: string, issuedAt: number, newRefreshToken: string): Promise<boolean> {
        const result = await deviceCollection.updateOne({userId}, {
            $set: {
                lastActiveDate: issuedAt, ip, refreshToken: newRefreshToken
            }
        })
        return result.matchedCount === 1
    },
    async addTokenToBlackList(token:string): Promise<boolean> {
        const newObject={
            _id:new ObjectId(),
            token
        }
        const result = await blackListCollection.insertOne(newObject)
        return result.acknowledged
    },
    async findTokenToBlackList(token:string): Promise<WithId<blackListType> | null> {
        return await blackListCollection.findOne({token})

    },
    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }
}