import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authInputType} from "../types/authType";
import {jwtService} from "../application/jwtService";
import {devicesService} from "../domain/devices-service";
import {validationRefreshToken} from "../midlewares/validations/input/validation-refresh-token";
import {securityQueryRepository} from "../repositories/security-query-repository";


export const securityRouter = Router({})


securityRouter.get('/devices', validationRefreshToken, async (req: Request<{}, {}, authInputType>, res: Response) => {

    const cookieRefreshToken = req.cookies.refreshToken
    const cookieRefreshTokeObj = await jwtService.verifyToken(cookieRefreshToken)
    if (!cookieRefreshTokeObj) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }


    const findDevises = await securityQueryRepository.getAllSessionsForUser(cookieRefreshTokeObj.userId)

    res.status(200).send(findDevises)
})

securityRouter.delete('/devices/:deviceId', validationRefreshToken, async (req: Request<{
    deviceId: string
}>, res: Response) => {
    const cookieRefreshToken = req.cookies.refreshToken

    const isDeletedStatus = await devicesService.deleteDeviceById(req.params.deviceId, cookieRefreshToken)

    if (isDeletedStatus.status === 2) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
    if (isDeletedStatus.status === 4) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }
    if (isDeletedStatus.status === 1) {
        res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
    }
    if (isDeletedStatus.status === 0) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    }
    res.sendStatus(500)
})
securityRouter.delete('/devices', validationRefreshToken, async (req: Request, res: Response) => {
    const cookieRefreshToken = req.cookies.refreshToken
    const cookieRefreshTokeObj = await jwtService.verifyToken(cookieRefreshToken)
    if (!cookieRefreshTokeObj) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    await devicesService.deleteAllOldDevices(cookieRefreshTokeObj.deviceId)
    res.sendStatus(204)
})





