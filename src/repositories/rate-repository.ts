import {rateLimitType} from "../db/dbType";
import {limitsMongooseModel} from "../db/mongooseSchema/mongooseSchema";
import { injectable } from "inversify";

@injectable()
export class RateRepository {
    async createRateLimit(item: rateLimitType): Promise<boolean> {
        const result = await limitsMongooseModel.create(item)
        return true
    }
}

