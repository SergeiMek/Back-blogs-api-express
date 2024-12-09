import {jwtService} from "../application/jwtService";
import {ObjectId} from "mongodb";
import {devicesRepository} from "../repositories/devices-repository";
import {deviceDBType} from "../db/dbType";
import {rateRepository} from "../repositories/rate-repository";

export const rateService = {
    async createRateLimit(url: string, ip: string, date:number): Promise<boolean> {
        const newItem = {
            _id: new ObjectId(),
            ip,
            URL: url,
            date
        }
        return await rateRepository.createRateLimit(newItem)
    },
    /* async deleteDevice(deviceId: string): Promise<boolean> {
         return await devicesRepository.deleteDevice(deviceId)
     },
     async findDeviceByDeviceId(deviceId: string): Promise<deviceDBType | null> {
         return await devicesRepository.findDeviceByDeviceId(deviceId)
     },
     async updateDevice(ip: string, deviceId: string, issuedAt: number): Promise<boolean> {
         return await devicesRepository.updateDevice(ip, deviceId, issuedAt)
     },
     async deleteAllOldDevices(currentDevice: string): Promise<boolean> {
         return await devicesRepository.deleteAllOldDevices(currentDevice)
     }*/
}