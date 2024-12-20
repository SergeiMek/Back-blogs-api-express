import {ObjectId} from "mongodb";
import {RareLimitDBClassType} from "../types/rateLimitType";
import {RateRepository} from "../repositories/rate-repository";


export class RateService {

    rateRepository:RateRepository

    constructor() {
        this.rateRepository = new RateRepository()
    }

    async createRateLimit(url: string, ip: string, date: number): Promise<boolean> {

        const newItem = new RareLimitDBClassType(new ObjectId(), ip, url, date)
        return await this.rateRepository.createRateLimit(newItem)
    }
}

