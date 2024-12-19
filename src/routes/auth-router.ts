import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authInputType, recoveryPasswordBodyType, registrationDataType} from "../types/authType";
import {usersService} from "../domain/users-service";
import {
    validationAuthInputPost,
    validationConfirmCode,
    validationEmail, validationRecoveryPassword
} from "../midlewares/validations/input/validation-auth-input";
import {jwtService} from "../application/jwtService";
import {authMiddleware} from "../midlewares/auth/authMiddlewareJWT";
import {authQueryRepository} from "../repositories/auth-query-repository";
import {validationUsersInputPost} from "../midlewares/validations/input/validation-users-input";
import {authService} from "../domain/auth-service";
import {OutputErrorsType} from "../types/videosType";
import {devicesService} from "../domain/devices-service";
import {ObjectId} from "mongodb";
import {validationRefreshToken} from "../midlewares/validations/input/validation-refresh-token";
import {rateLimiter} from "../midlewares/rate-limiter";
import {devicesMongooseModel, usersMongooseModel} from "../db/mongooseSchema/mongooseSchema";


export const authRouter = Router({})

class AuthController {
    async loginUser(req: Request<{}, {}, authInputType>, res: Response) {

        const {loginOrEmail, password} = req.body

        const checkCredentialsUser = await usersService.checkCredentials(loginOrEmail, password)
        if (checkCredentialsUser) {
            const ip = req.ip;
            const userAgent = req.headers["user-agent"] || "unknown";
            const newAccessToken = await jwtService.createAccessTokenJWT(checkCredentialsUser)
            const newRefreshToken = await jwtService.createRefreshTokenJWT(checkCredentialsUser)
            await devicesService.createDevice(newRefreshToken, ip!, userAgent)

            res.cookie('refreshToken', newRefreshToken, {httpOnly: true, secure: true})
            res.status(200).json({accessToken: newAccessToken});

        } else {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        }
    }

    async logoutUser(req: Request, res: Response) {
        const cookieRefreshToken = req.cookies.refreshToken
        const cookieRefreshTokenObj = await jwtService.verifyToken(cookieRefreshToken)
        if (cookieRefreshTokenObj) {
            const cookieDeviceId = cookieRefreshTokenObj.deviceId
            await devicesService.deleteDevice(cookieDeviceId)
            res.clearCookie('refreshToken')
            res.sendStatus(204);
        } else {
            res.sendStatus(401);
        }
    }

    async refreshToken(req: Request, res: Response) {
        const ip = req.ip!
        const cookieRefreshToken = req.cookies.refreshToken
        const cookieRefreshTokenObj = await jwtService.verifyToken(cookieRefreshToken)
        const deviceId = cookieRefreshTokenObj!.deviceId
        const userId = cookieRefreshTokenObj!.userId.toString()

        const user = await usersService.findUserById(new ObjectId(userId))


        const newAccessToken = await jwtService.createAccessTokenJWT(user!, deviceId)
        const newRefreshToken = await jwtService.createAccessTokenJWT(user!, deviceId)

        const newRefreshTokenObj = await jwtService.verifyToken(newRefreshToken)


        const newIssuedAt = newRefreshTokenObj!.iat

        await devicesService.updateDevice(ip, deviceId, newIssuedAt)

        res.cookie('refreshToken', newRefreshToken, {
            secure: true,
            httpOnly: true
        })
            .status(HTTP_STATUSES.OK_200)
            .json({accessToken: newAccessToken})
    }

    async registrationConfirmation(req: Request<{}, {}, {
        code: string
    }>, res: Response) {
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
    }

    async registration(req: Request<{}, {}, registrationDataType>, res: Response) {
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

    }

    async passwordRecovery(req: Request<{}, {}, {
        email: string
    }>, res: Response) {
        const email = req.body.email
        const errors: OutputErrorsType = {
            errorsMessages: []
        }
        const registrationResult = await authService.sendPasswordRecoveryCode(email)

        if (registrationResult.status === 3) {
            errors.errorsMessages.push({
                message: 'error when sending email',
                field: 'errorMessage'
            })
        }

        if (errors.errorsMessages.length > 0) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors)
            return
        }
        if (registrationResult.status === 7) {
            res.sendStatus(500)
            return
        }


        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    }

    async registrationEmailResending(req: Request<{}, {}, {
        email: string
    }>, res: Response) {

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
    }

    async me(req: Request, res: Response) {

        const userData = await authQueryRepository.getUserData(req.user!._id)
        if (userData) {
            res.status(HTTP_STATUSES.OK_200).send(userData)
        } else {
            res.sendStatus(500)
        }
    }

    async newPassword(req: Request<{}, {}, recoveryPasswordBodyType>, res: Response) {

        const {recoveryCode, newPassword} = req.body

        const errors: OutputErrorsType = {
            errorsMessages: []
        }
        const confirmCodeResult = await authService.changePassword(recoveryCode, newPassword)

        if (confirmCodeResult.status === 4) {
            errors.errorsMessages.push({
                message: 'User by code not found',
                field: 'recoveryCode'
            })
            res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors)
            return
        }
        if (confirmCodeResult.status === 7) {
            errors.errorsMessages.push({
                message: '',
                field: 'server error'
            })
            res.status(500).send(errors)
            return
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
        return
    }
}


const authControllerInstance = new AuthController()

authRouter.post('/login', rateLimiter, validationAuthInputPost, authControllerInstance.loginUser)
authRouter.post('/logout', validationRefreshToken, authControllerInstance.logoutUser)
authRouter.post('/refresh-token', rateLimiter, validationRefreshToken, authControllerInstance.refreshToken)
authRouter.post('/registration-confirmation', rateLimiter, validationConfirmCode, authControllerInstance.registrationConfirmation)
authRouter.post('/registration', rateLimiter, validationUsersInputPost, authControllerInstance.registration)
authRouter.post('/password-recovery', rateLimiter, validationEmail, authControllerInstance.passwordRecovery)
authRouter.post('/registration-email-resending', rateLimiter, validationEmail, authControllerInstance.registrationEmailResending)
authRouter.get('/me', authMiddleware, authControllerInstance.me)
authRouter.post('/new-password', rateLimiter, validationRecoveryPassword, authControllerInstance.newPassword)







authRouter.post('/get-users', async (req: Request<{}, {}, { num: string }>, res: Response) => {
    /* const users =  await usersCollection.find().toArray()
       res.status(200).send(users)*/
    if (req.body.num === "1") {
        const users = await usersMongooseModel.find().lean()
        res.status(200).send(users)
    }

    if (req.body.num === "2") {
        await usersMongooseModel.deleteMany()
        res.sendStatus(200)
    }
    if (req.body.num === "3") {
        const devise = await devicesMongooseModel.find().lean()
        res.status(200).send(devise)
    }
    return
})




