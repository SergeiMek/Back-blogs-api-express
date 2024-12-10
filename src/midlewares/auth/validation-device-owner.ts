import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../../settings";
import {jwtService} from "../../application/jwtService";
import {devicesService} from "../../domain/devices-service";


export const validationDeviceOwner = async (req: Request, res: Response, next: NextFunction) => {

    const cookieRefreshToken = req.cookies.refreshToken;

    if (!cookieRefreshToken) {
        res.sendStatus(401);
        return;
    }
    const cookieRefreshTokenObj = await jwtService.verifyToken(
        cookieRefreshToken
    );
    if (!cookieRefreshTokenObj) {
        res.sendStatus(401);
        return;
    }
    const deviceId = req.params.deviceId;
    const device = await devicesService.findDeviceByDeviceId(deviceId);
    if(!device){
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        return
    }


    const deviceUserId = device?.userId;
    const cookieUserId = cookieRefreshTokenObj.userId.toString();
    if (deviceUserId !== cookieUserId) {
        res.sendStatus(403);
        return;
    }

    next();
}