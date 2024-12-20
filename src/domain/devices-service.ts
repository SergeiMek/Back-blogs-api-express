import {deviceDBType} from "../db/dbType";
import {ObjectId} from "mongodb";
import {jwtService} from "../application/jwtService";
import {deviseDBClassType} from "../types/diviceType";
import {DevicesRepository} from "../repositories/devices-repository";


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


export class DevicesService {

    constructor(protected devicesRepository: DevicesRepository) {}

    async createDevice(newRefreshToken: string, ip: string, userAgent: string) {
        const newRefreshTokenObj = await jwtService.verifyToken(newRefreshToken);
        if (!newRefreshTokenObj) {
            return null
        }
        const userId = newRefreshTokenObj.userId;
        const deviceId = newRefreshTokenObj.deviceId;
        const expirationDate = newRefreshTokenObj.exp;
        const issuedAt = newRefreshTokenObj.iat;


        const newDevice = new deviseDBClassType(new ObjectId, ip, userAgent, userId, deviceId, issuedAt, expirationDate)

        return await this.devicesRepository.createDevice(newDevice)

    }

    async deleteDevice(deviceId: string): Promise<boolean> {
        return await this.devicesRepository.deleteDevice(deviceId)
    }

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
        const deleted = await this.devicesRepository.deleteDevice(deviceId)
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
    }

    async findDeviceByDeviceId(deviceId: string): Promise<deviceDBType | null> {
        return await this.devicesRepository.findDeviceByDeviceId(deviceId)
    }

    async updateDevice(ip: string, deviceId: string, issuedAt: number): Promise<boolean> {
        return await this.devicesRepository.updateDevice(ip, deviceId, issuedAt)
    }

    async deleteAllOldDevices(currentDevice: string): Promise<boolean> {
        return await this.devicesRepository.deleteAllOldDevices(currentDevice)
    }
}

