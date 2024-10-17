import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";
import {OutputErrorsType} from "../../types/videosType";
import {FieldNamesType} from "../../types/output-errors-type";
import {HTTP_STATUSES} from "../../settings";


export const inputCheckErrorsMiddleware = (req: Request, res: Response<OutputErrorsType>, next: NextFunction) => {
    const e = validationResult(req)
    if (!e.isEmpty()) {
        const eArray = e.array({onlyFirstError: true}) as { path: FieldNamesType, msg: string }[]
        // console.log(eArray)

        res
            .status(HTTP_STATUSES.BAD_REQUEST_400)
            .json({
                errorsMessages: eArray.map(x => ({field: x.path, message: x.msg}))
            })
        return
    }

    next()
}