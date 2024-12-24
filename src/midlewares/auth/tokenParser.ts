import {NextFunction, Request, Response} from "express";
import {jwtService} from "../../application/jwtService";
import {ObjectId} from "mongodb";
import {usersService} from "../../commposition-root";



export const tokenParser = async (req: Request, res: Response, next: NextFunction) => {

    const accessToken = req.headers.authorization?.split(' ')[1]

    if (accessToken) {
        const accessTokenObj = await jwtService.verifyToken(accessToken)
        const userId = new ObjectId(accessTokenObj?.userId)
            req.user = await usersService.findUserById(userId)
    }
    next()

}