import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../../settings";
import {jwtService} from "../../application/jwtService";
import {UsersService} from "../../domain/users-service";



const usersService = new UsersService

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.headers.authorization) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    const token = req.headers.authorization!.split(' ')[1]

    const userId = await jwtService.getUserIdByToken(token)

    if (userId) {
        req.user = await usersService.findUserById(userId)
        next()

    } else {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }

}

