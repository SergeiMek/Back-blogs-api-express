import {OutputSessionsType} from "../types/securityType";
import {deviceDBType} from "../db/dbType";
import {devicesMongooseModel} from "../db/mongooseSchema/mongooseSchema";
import { injectable } from "inversify";


@injectable()
export class SecurityQueryRepository{
    async getAllSessionsForUser(userId: string) {

        const devises = await devicesMongooseModel.find({userId:userId}).lean()
        if (!devises) return null
        //return devises
        return this._securityMapping(devises)
    }
    _securityMapping(array: deviceDBType[]): OutputSessionsType[] {
        return array.map((devise) => {
            return {
                ip: devise.ip,
                title: devise.title,
                lastActiveDate: new Date(devise.lastActiveDate * 1000).toISOString(),
                deviceId: devise.deviceId
            };
        });
    }
}

