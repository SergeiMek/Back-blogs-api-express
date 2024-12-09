import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authInputType} from "../types/authType";
import {usersService} from "../domain/users-service";
import {jwtService} from "../application/jwtService";
import {authMiddleware} from "../midlewares/auth/authMiddlewareJWT";
import {devicesService} from "../domain/devices-service";
import {ObjectId} from "mongodb";
import {validationRefreshToken} from "../midlewares/validations/input/validation-refresh-token";
import {securityQueryRepository} from "../repositories/security-query-repository";
import {validationDeviceOwner} from "../midlewares/auth/validation-device-owner";


export const securityRouter = Router({})


securityRouter.get('/devices',  validationRefreshToken,async (req: Request<{}, {}, authInputType>, res: Response) => {

    const cookieRefreshToken = req.cookies.refreshToken
    const cookieRefreshTokeObj = await jwtService.verifyToken(cookieRefreshToken)
    if (!cookieRefreshTokeObj) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }


    const findDevises = await securityQueryRepository.getAllSessionsForUser(cookieRefreshTokeObj.userId)

    res.status(200).send(findDevises)
})

securityRouter.delete('/devices/:deviceId', validationDeviceOwner, async (req: Request<{
    deviceId: string
}>, res: Response) => {


    const deleted = await devicesService.deleteDevice(req.params.deviceId)
    if (deleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)

    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)

    }
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





