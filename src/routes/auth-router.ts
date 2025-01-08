import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authInputType, recoveryPasswordBodyType, registrationDataType} from "../types/authType";
import {
    validationAuthInputPost,
    validationConfirmCode,
    validationEmail,
    validationRecoveryPassword
} from "../midlewares/validations/input/validation-auth-input";
import {jwtService} from "../application/jwtService";
import {authMiddleware} from "../midlewares/auth/authMiddlewareJWT";
import {validationUsersInputPost} from "../midlewares/validations/input/validation-users-input";
import {OutputErrorsType} from "../types/videosType";
import {ObjectId} from "mongodb";
import {validationRefreshToken} from "../midlewares/validations/input/validation-refresh-token";
import {rateLimiter} from "../midlewares/rate-limiter";
import {
    commentsMongooseModel,
    devicesMongooseModel,
    postsMongooseModel,
    usersMongooseModel
} from "../db/mongooseSchema/mongooseSchema";
import {UsersService} from "../domain/users-service";
import {DevicesService} from "../domain/devices-service";
import {AuthQueryRepository} from "../repositories/auth-query-repository";
import {AuthService} from "../domain/auth-service";
import {container} from "../commposition-root";
import {inject, injectable} from "inversify";


export const authRouter = Router({})

@injectable()
export class AuthController {

    constructor(
        @inject(UsersService) protected usersService: UsersService,
        @inject(DevicesService) protected devicesService: DevicesService,
        @inject(AuthQueryRepository) protected authQueryRepository: AuthQueryRepository,
        @inject(AuthService) protected authService: AuthService,
    ) {
    }

    async loginUser(req: Request<{}, {}, authInputType>, res: Response) {

        const {loginOrEmail, password} = req.body

        const checkCredentialsUser = await this.usersService.checkCredentials(loginOrEmail, password)
        if (checkCredentialsUser) {
            const ip = req.ip;
            const userAgent = req.headers["user-agent"] || "unknown";
            const newAccessToken = await jwtService.createAccessTokenJWT(checkCredentialsUser)
            const newRefreshToken = await jwtService.createRefreshTokenJWT(checkCredentialsUser)
            await this.devicesService.createDevice(newRefreshToken, ip!, userAgent)

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
            await this.devicesService.deleteDevice(cookieDeviceId)
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

        const user = await this.usersService.findUserById(new ObjectId(userId))


        const newAccessToken = await jwtService.createAccessTokenJWT(user!, deviceId)
        const newRefreshToken = await jwtService.createAccessTokenJWT(user!, deviceId)

        const newRefreshTokenObj = await jwtService.verifyToken(newRefreshToken)


        const newIssuedAt = newRefreshTokenObj!.iat

        await this.devicesService.updateDevice(ip, deviceId, newIssuedAt)

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
        const confirmCodeResult = await this.authService.confirmEmail(req.body.code)

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
        const registrationResult = await this.authService.registerUser({email, login, password})

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
        const registrationResult = await this.authService.sendPasswordRecoveryCode(email)

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

        const result = await this.authService.resendConfirmationCode(req.body.email)
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

        const userData = await this.authQueryRepository.getUserData(req.user!._id)
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
        const confirmCodeResult = await this.authService.changePassword(recoveryCode, newPassword)

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

//const authControllerInstance = new AuthController(usersService, devicesService, authQueryRepository, authService)
const authControllerInstance = container.resolve(AuthController)

authRouter.post('/login', rateLimiter, validationAuthInputPost, authControllerInstance.loginUser.bind(authControllerInstance))
authRouter.post('/logout', validationRefreshToken, authControllerInstance.logoutUser.bind(authControllerInstance))
authRouter.post('/refresh-token', rateLimiter, validationRefreshToken, authControllerInstance.refreshToken.bind(authControllerInstance))
authRouter.post('/registration-confirmation', rateLimiter, validationConfirmCode, authControllerInstance.registrationConfirmation.bind(authControllerInstance))
authRouter.post('/registration', rateLimiter, validationUsersInputPost, authControllerInstance.registration.bind(authControllerInstance))
authRouter.post('/password-recovery', rateLimiter, validationEmail, authControllerInstance.passwordRecovery.bind(authControllerInstance))
authRouter.post('/registration-email-resending', rateLimiter, validationEmail, authControllerInstance.registrationEmailResending.bind(authControllerInstance))
authRouter.get('/me', authMiddleware, authControllerInstance.me.bind(authControllerInstance))
authRouter.post('/new-password', rateLimiter, validationRecoveryPassword, authControllerInstance.newPassword.bind(authControllerInstance))


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
    if (req.body.num === "4") {
        const comments = await commentsMongooseModel.find().lean()
        res.status(200).send(comments)
    }
    if (req.body.num === "5") {
        const comments = await postsMongooseModel.find().lean()
        res.status(200).send(comments)
    }
    return
})




