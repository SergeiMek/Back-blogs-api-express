import {ObjectId} from "mongodb";
import {RareLimitDBClassType} from "../types/rateLimitType";
import {RateRepository} from "../repositories/rate-repository";
import {inject, injectable} from "inversify";

@injectable()
export class RateService {



    constructor(@inject(RateRepository) protected rateRepository:RateRepository) {}

    async createRateLimit(url: string, ip: string, date: number): Promise<boolean> {

        const newItem = new RareLimitDBClassType(new ObjectId(), ip, url, date)
        return await this.rateRepository.createRateLimit(newItem)
    }
}

