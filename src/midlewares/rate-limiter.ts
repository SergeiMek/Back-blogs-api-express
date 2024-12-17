import {NextFunction, Request, Response} from "express";
import {rateService} from "../domain/rate-servise";
import {limitsMongooseModel} from "../db/mongooseSchema/mongooseSchema";



export const rateLimiter = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const ip = req.ip;
    const endpoint = req.originalUrl;

    const currentDate = Date.now()

    await rateService.createRateLimit(endpoint, ip!, currentDate)

    const tenSecondsAgo = Number(new Date(Date.now() - 10 * 1000))

    const count = await limitsMongooseModel.countDocuments({
        ip: ip,
        URL: endpoint,
        date: {$gte: tenSecondsAgo}
    })
    if (count > 5) {
        res.sendStatus(429)
        return
    }

    next();
};