import {NextFunction, Request, Response} from "express";
import {jwtService} from "../../application/jwtService";
import {ObjectId} from "mongodb";
import {usersMongooseModel} from "../../db/mongooseSchema/mongooseSchema";



export const tokenParser = async (req: Request, res: Response, next: NextFunction) => {

    const accessToken = req.headers.authorization?.split(' ')[1]

    if (accessToken) {
        const accessTokenObj = await jwtService.verifyToken(accessToken)
        const userId = new ObjectId(accessTokenObj?.userId)
            req.user = await usersMongooseModel.findOne({_id: userId})
    }
    next()

}