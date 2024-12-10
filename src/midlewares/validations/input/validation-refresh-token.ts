import {NextFunction, Request, Response} from "express";
import {jwtService} from "../../../application/jwtService";
import {devicesService} from "../../../domain/devices-service";


export const validationRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const cookieRefreshToken = req.cookies.refreshToken

    if (!cookieRefreshToken) {
        res.sendStatus(401)
        return
    }


    const cookieRefreshTokenObj = await jwtService.verifyToken(cookieRefreshToken)

    if (!cookieRefreshTokenObj) {
        res.sendStatus(401)
        return
    }

    const deviceId = cookieRefreshTokenObj.deviceId

    const findDevise = await devicesService.findDeviceByDeviceId(deviceId)

    const cookieRefreshTokenIat = cookieRefreshTokenObj.iat


    /*if(findDevise){
        if(cookieRefreshTokenIat !== findDevise.lastActiveDate){
            res.sendStatus(401)
            return
        }
    }*/

    if (findDevise) {
        if (cookieRefreshTokenIat < findDevise.lastActiveDate) {
            res.sendStatus(401);
            return;
        }
    } else {
        res.sendStatus(401);
        return;
    }

    next()
}