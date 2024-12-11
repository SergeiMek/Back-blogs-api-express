import {blackListType, deviceDBType, usersDBType} from "../db/dbType";
import {v4 as uuidv4} from "uuid/dist/esm";
import jwt from "jsonwebtoken";
import {SETTINGS} from "../settings";
import {ObjectId, WithId} from "mongodb";
import {DeviceViewModel} from "../types/diviceType";
import {jwtService} from "../application/jwtService";
import {devicesRepository} from "../repositories/devices-repository";
import {deviceCollection} from "../db/dbInMongo";


enum ResultStatus {
    Success = 0,
    Forbidden = 1,
    NotFound = 2,
    ServerError = 3,
    NotAuthorized = 4
}

type Result<T> = {
    status: ResultStatus
    errorMessage?: string
    data: T
}


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
            title: userAgent,
            userId,
            deviceId,
            lastActiveDate: issuedAt,
            expirationDate,
        }

        return await devicesRepository.createDevice(newDevice)

    },
    async deleteDevice(deviceId: string): Promise<boolean> {
        return await devicesRepository.deleteDevice(deviceId)
    },
    async deleteDeviceById(deviceId: string, refreshToken: string): Promise<Result<null | boolean>> {
        const findDevise = await this.findDeviceByDeviceId(deviceId)
        if (!findDevise) {
            return {
                status: ResultStatus.NotFound,
                errorMessage: 'Devise not found',
                data: null
            }
        }
        const cookieRefreshTokenObj = await jwtService.verifyToken(refreshToken);
        if (!cookieRefreshTokenObj) {
            return {
                status: ResultStatus.NotAuthorized,
                errorMessage: 'not authorized',
                data: null
            }
        }
        const deviceUserId = findDevise.userId;
        const cookieUserId = cookieRefreshTokenObj.userId
        if (deviceUserId !== cookieUserId) {
            return {
                status: ResultStatus.Forbidden,
                errorMessage: 'The device belongs to the wrong user',
                data: null
            }
        }
        const deleted = await devicesRepository.deleteDevice(deviceId)
        if (deleted) {
            return {
                status: ResultStatus.Success,
                errorMessage: 'ok',
                data: null
            }
        }
        return {
                status: ResultStatus.ServerError,
                errorMessage: 'server error',
                data: null
            }
    },
    async findDeviceByDeviceId(deviceId: string): Promise<deviceDBType | null> {
        return await devicesRepository.findDeviceByDeviceId(deviceId)
    },
    async updateDevice(ip: string, deviceId: string, issuedAt: number): Promise<boolean> {
        return await devicesRepository.updateDevice(ip, deviceId, issuedAt)
    },
    async deleteAllOldDevices(currentDevice: string): Promise<boolean> {
        return await devicesRepository.deleteAllOldDevices(currentDevice)
    }
}