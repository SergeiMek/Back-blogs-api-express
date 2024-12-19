import {deviceDBType} from "../db/dbType";
import {ObjectId} from "mongodb";
import {devicesMongooseModel} from "../db/mongooseSchema/mongooseSchema";


class DevicesRepository {
    async createDevice(deviceDara: deviceDBType): Promise<ObjectId> {
        const result = await devicesMongooseModel.create(deviceDara)
        return result._id
    }

    async deleteDevice(id: string): Promise<boolean> {
        //if (this._checkObjectId(id))return false
        const result = await devicesMongooseModel.deleteOne({deviceId: id})
        return result.deletedCount === 1
    }

    async findDeviceByDeviceId(deviceId: string): Promise<deviceDBType | null> {
        return devicesMongooseModel.findOne({deviceId})
    }

    async updateDevice(ip: string, deviceId: string, issuedAt: number): Promise<boolean> {
        const result = await devicesMongooseModel.updateOne({deviceId}, {
            $set: {
                lastActiveDate: issuedAt, ip
            }
        })
        return result.matchedCount === 1
    }

    async deleteAllOldDevices(currentDevice: string): Promise<boolean> {
        const result = await devicesMongooseModel.deleteMany({deviceId: {$ne: currentDevice}})
        return result.acknowledged
    }

    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }
}

export const devicesRepository = new DevicesRepository()