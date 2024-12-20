import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authInputType} from "../types/authType";
import {jwtService} from "../application/jwtService";
import {validationRefreshToken} from "../midlewares/validations/input/validation-refresh-token";
import {SecurityQueryRepository} from "../repositories/security-query-repository";
import {DevicesService} from "../domain/devices-service";


export const securityRouter = Router({})


export class SecurityController {

    securityQueryRepository: SecurityQueryRepository
    devicesService: DevicesService

    constructor() {
        this.securityQueryRepository = new SecurityQueryRepository()
        this.devicesService = new DevicesService()
    }

    async getAllSessionsForUser(req: Request<{}, {}, authInputType>, res: Response) {

        const cookieRefreshToken = req.cookies.refreshToken
        const cookieRefreshTokeObj = await jwtService.verifyToken(cookieRefreshToken)
        if (!cookieRefreshTokeObj) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
            return
        }

        const findDevises = await this.securityQueryRepository.getAllSessionsForUser(cookieRefreshTokeObj.userId)
        res.status(200).send(findDevises)
        return
    }

    async deleteDeviceById(req: Request<{
        deviceId: string
    }>, res: Response) {
        const cookieRefreshToken = req.cookies.refreshToken

        const isDeletedStatus = await this.devicesService.deleteDeviceById(req.params.deviceId, cookieRefreshToken)

        if (isDeletedStatus.status === 2) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
            return
        }
        if (isDeletedStatus.status === 4) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
            return
        }
        if (isDeletedStatus.status === 1) {
            res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
            return
        }
        if (isDeletedStatus.status === 0) {
            res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
            return
        }
        res.sendStatus(500)
    }

    async deleteAllOldDevices(req: Request, res: Response) {
        const cookieRefreshToken = req.cookies.refreshToken
        const cookieRefreshTokeObj = await jwtService.verifyToken(cookieRefreshToken)
        if (!cookieRefreshTokeObj) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
            return
        }
        await this.devicesService.deleteAllOldDevices(cookieRefreshTokeObj.deviceId)
        res.sendStatus(204)
        return
    }
}

const securityControllerInstance = new SecurityController()

securityRouter.get('/devices', validationRefreshToken, securityControllerInstance.getAllSessionsForUser.bind(securityControllerInstance))
securityRouter.delete('/devices/:deviceId', validationRefreshToken, securityControllerInstance.deleteDeviceById.bind(securityControllerInstance))
securityRouter.delete('/devices', validationRefreshToken, securityControllerInstance.deleteAllOldDevices.bind(securityControllerInstance))





