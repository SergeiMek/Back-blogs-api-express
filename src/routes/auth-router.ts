import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authInputType, registrationDataType} from "../types/authType";
import {usersService} from "../domain/users-service";
import {
    validationAuthInputPost,
    validationConfirmCode,
    validationEmail
} from "../midlewares/validations/input/validation-auth-input";
import {jwtService} from "../application/jwtService";
import {authMiddleware} from "../midlewares/auth/authMiddlewareJWT";
import {AuthQueryRepository} from "../repositories/auth-query-repository";
import {validationUsersInputPost} from "../midlewares/validations/input/validation-users-input";
import {authService} from "../domain/auth-service";
import {OutputErrorsType} from "../types/videosType";
import {usersCollection} from "../db/dbInMongo";


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
authRouter.post('/registration-confirmation', validationConfirmCode, async (req: Request<{}, {}, {
    code: string
}>, res: Response) => {
    const errors: OutputErrorsType = {
        errorsMessages: []
    }
    const confirmCodeResult = await authService.confirmEmail(req.body.code)

    if (confirmCodeResult.status === 4) {
        errors.errorsMessages.push({
            message: 'User by code not found',
            field: 'code'
        })
    }
    if (confirmCodeResult.status === 5) {
        errors.errorsMessages.push({
            message: 'User confirmed',
            field: 'code'
        })
    }
    if (confirmCodeResult.status === 6) {
        errors.errorsMessages.push({
            message: 'Code life date is not valid',
            field: 'code'
        })
    }
    if (errors.errorsMessages.length > 0) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors)
        return
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
})

authRouter.post('/registration', validationUsersInputPost, async (req: Request<{}, {}, registrationDataType>, res: Response) => {
    let {email, login, password} = req.body
    const errors: OutputErrorsType = {
        errorsMessages: []
    }
    const registrationResult = await authService.registerUser({email, login, password})
    if (registrationResult.status === 1) {
        errors.errorsMessages.push({
            message: 'Email already exists',
            field: 'email'
        })
    }
    if (registrationResult.status === 2) {
        errors.errorsMessages.push({
            message: 'Login already exists',
            field: 'login'
        })
    }
    if (errors.errorsMessages.length > 0) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors)
        return
    }

    if (registrationResult.status === 3) {
        res.sendStatus(500)
        return
    }


    res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)

})

authRouter.post('/registration-email-resending', validationEmail, async (req: Request<{}, {}, {
    email: string
}>, res: Response) => {

    const errors: OutputErrorsType = {
        errorsMessages: []
    }

    const result = await authService.resendConfirmationCode(req.body.email)
    if (result.status === 4) {
        errors.errorsMessages.push({
            message: 'User by mail not found',
            field: 'email'
        })
    }
    if (result.status === 5) {
        errors.errorsMessages.push({
            message: 'User confirmed',
            field: 'email'
        })
    }
    if (result.status === 3) {
        res.sendStatus(500)
        return
    }
    if (errors.errorsMessages.length > 0) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors)
        return
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
})


authRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {

    const userData = await AuthQueryRepository.getUserData(req.user!._id)
    if (userData) {
        res.status(HTTP_STATUSES.OK_200).send(userData)
    } else {
        res.sendStatus(500)
    }

})


authRouter.post('/get-users', async (req: Request<{}, {}, { num: string }>, res: Response) => {
    /* const users =  await usersCollection.find().toArray()
       res.status(200).send(users)*/
    if (req.body.num === "1") {
        const users = await usersCollection.find().toArray()
        res.status(200).send(users)
    }

    if (req.body.num === "2") {
        await usersCollection.deleteMany()
        res.sendStatus(200)
    }
    return
})




