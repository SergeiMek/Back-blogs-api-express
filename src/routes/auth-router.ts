import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authInputType} from "../types/authType";
import {usersService} from "../domain/users-service";
import {validationAuthInputPost} from "../midlewares/validations/input/validation-auth-input";
import {jwtService} from "../application/jwtService";
import {authMiddleware} from "../midlewares/auth/authMiddlewareJWT";
import {AuthQueryRepository} from "../repositories/auth-query-repository";


export const authRouter = Router({})


authRouter.post('/login', validationAuthInputPost, async (req: Request<{}, {}, authInputType>, res: Response) => {

    const {loginOrEmail, password} = req.body

    const user = await usersService.checkCredentials(loginOrEmail, password)
    if (user) {
        const token = await jwtService.createJWT(user)
        res.status(HTTP_STATUSES.OK_200).send({accessToken: token})
    } else {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }
})


authRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {

    const userData = await AuthQueryRepository.getUserData(req.user!._id)
    if (userData) {
        res.status(HTTP_STATUSES.OK_200).send(userData)
    } else {
        res.sendStatus(500)
    }

})







