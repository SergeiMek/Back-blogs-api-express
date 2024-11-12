import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authInputType} from "../types/authType";
import {usersService} from "../domain/users-service";
import {validationAuthInputPost} from "../midlewares/validations/input/validation-auth-input";


export const authRouter = Router({})


authRouter.post('/login', validationAuthInputPost, async (req: Request<{}, {}, authInputType>, res: Response) => {

    const {loginOrEmail, password} = req.body

    const checkResult = await usersService.checkCredentials(loginOrEmail, password)
    if (checkResult) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    } else {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }
})







