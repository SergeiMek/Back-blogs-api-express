import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES, SETTINGS} from "../../settings";


/*export const authBasic = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization !== 'Basic YWRtaW46cXdlcnR5') {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    } else {
        next();
    }
};*/


export const fromUTF8ToBase64 = (code: string) => {
    const buff2 = Buffer.from(code, 'utf8')
    const codedAuth = buff2.toString('base64')
    return codedAuth
}

export const authBasic = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers['authorization'] as string // 'Basic xxxx'
    // console.log(auth)
    if (!auth) {
        res
            .status(401)
            .json({})
        return
    }
    if (auth.slice(0, 6) !== 'Basic ') {
        res
            .status(401)
            .json({})
        return
    }

    // const decodedAuth = fromBase64ToUTF8(auth.slice(6))
    const codedAuth = fromUTF8ToBase64(SETTINGS.ADMIN)

    // if (decodedAuth !== SETTINGS.ADMIN) {
    if (auth.slice(6) !== codedAuth) {
        res
            .status(401)
            .json({})
        return
    }

    next()
};