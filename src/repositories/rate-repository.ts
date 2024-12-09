import {deviceDBType, rateLimitType} from "../db/dbType";
import {ObjectId} from "mongodb";
import {deviceCollection, limitCollection} from "../db/dbInMongo";


export const rateRepository = {
    async createRateLimit(item: rateLimitType): Promise<boolean> {
        const result = await limitCollection.insertOne(item)
        return result.acknowledged
    },
    /*async deleteDevice(id: string): Promise<boolean> {
        const result = await deviceCollection.deleteOne({deviceId: id})
        return result.deletedCount === 1
    },
    async findDeviceByDeviceId(deviceId: string): Promise<deviceDBType | null> {
        return await deviceCollection.findOne({deviceId})
    },
    async updateDevice(ip: string, deviceId: string, issuedAt: number): Promise<boolean> {
        const result = await deviceCollection.updateOne({deviceId}, {
            $set: {
                lastActiveDate: issuedAt, ip
            }
        })
        return result.matchedCount === 1
    },
    async deleteAllOldDevices(currentDevice: string): Promise<boolean> {
        const result = await deviceCollection.deleteMany({deviceId: {$ne: currentDevice}})
        return result.acknowledged
    },
    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }*/
}