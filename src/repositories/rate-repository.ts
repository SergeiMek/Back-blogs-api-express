import {rateLimitType} from "../db/dbType";
import {limitsMongooseModel} from "../db/mongooseSchema/mongooseSchema";


class RateRepository {
    async createRateLimit(item: rateLimitType): Promise<boolean> {
        const result = await limitsMongooseModel.create(item)
        return true
    }
}

export const rateRepository = new RateRepository()