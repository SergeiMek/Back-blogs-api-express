import {rateLimitType} from "../db/dbType";
import {limitsMongooseModel} from "../db/mongooseSchema/mongooseSchema";


export const rateRepository = {
    async createRateLimit(item: rateLimitType): Promise<boolean> {
        const result = await limitsMongooseModel.create(item)
        return true
    }
}