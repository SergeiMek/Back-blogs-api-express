import {deviceDBType} from "../db/dbType";
import {ObjectId} from "mongodb";
import {deviceCollection} from "../db/dbInMongo";


export const devicesRepository = {
    async createDevice(deviceDara: deviceDBType): Promise<ObjectId> {
        const result = await deviceCollection.insertOne(deviceDara)
        return result.insertedId
    },
    async deleteDevice(id: string): Promise<boolean> {
        //if (this._checkObjectId(id))return false
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
    }
}