import {ObjectId} from "mongodb";
import {rateRepository} from "../repositories/rate-repository";
import {RareLimitDBClassType} from "../types/rateLimitType";


class RateService {
    async createRateLimit(url: string, ip: string, date: number): Promise<boolean> {

        const newItem = new RareLimitDBClassType(new ObjectId(), ip, url, date)
        return await rateRepository.createRateLimit(newItem)
    }
}

export const rateService = new RateService()