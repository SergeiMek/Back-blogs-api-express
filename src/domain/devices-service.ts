import {blackListType, deviceDBType, usersDBType} from "../db/dbType";
import {v4 as uuidv4} from "uuid/dist/esm";
import jwt from "jsonwebtoken";
import {SETTINGS} from "../settings";
import {ObjectId, WithId} from "mongodb";
import {DeviceViewModel} from "../types/diviceType";
import {jwtService} from "../application/jwtService";
import {devicesRepository} from "../repositories/devices-repository";
import {deviceCollection} from "../db/dbInMongo";

export const devicesService = {
    async createDevice(newRefreshToken: string, ip: string, userAgent: string) {
        const newRefreshTokenObj = await jwtService.verifyToken(newRefreshToken);
        if (!newRefreshTokenObj) {
            return null
        }
        const userId = newRefreshTokenObj.userId;
        const deviceId = newRefreshTokenObj.deviceId;
        const expirationDate = newRefreshTokenObj.exp;
        const issuedAt = newRefreshTokenObj.iat;

        const newDevice = {
            _id: new ObjectId,
            ip: ip,
            title: 'string',
            userId,
            deviceId,
            lastActiveDate: issuedAt,
            expirationDate,
            refreshToken: newRefreshToken,
        }

        return await devicesRepository.createDevice(newDevice)

    },
    async deleteDevice(deviceId: string) {
        return await devicesRepository.deleteDevice(deviceId)
    },
    async findDeviceById(deviceId: string): Promise<deviceDBType | null> {
        return await devicesRepository.findDeviceById(deviceId)
    },
    async updateDevice(ip: string, userId: string, issuedAt: number, newRefreshToken: string): Promise<boolean> {
        return await devicesRepository.updateDevice(ip, userId, issuedAt, newRefreshToken)
    },
    async addTokenToBlackList(token: string): Promise<boolean> {
        return await devicesRepository.addTokenToBlackList(token)
    },
    async findTokenToBlackList(token: string): Promise<WithId<blackListType> | null> {
        return await devicesRepository.findTokenToBlackList(token)
    }
}