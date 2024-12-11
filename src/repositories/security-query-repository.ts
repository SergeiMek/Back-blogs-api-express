import {ObjectId} from "mongodb";
import {deviceCollection, usersCollection} from "../db/dbInMongo";
import {OutputAutData} from "../types/authType";
import {OutputSessionsType} from "../types/securityType";
import {blogsDBType, blogsType, deviceDBType} from "../db/dbType";

export const securityQueryRepository = {
    async getAllSessionsForUser(userId: string) {

        const devises = await deviceCollection.find({userId:userId}).toArray()
        if (!devises) return null
        //return devises
        return this._securityMapping(devises)
    },
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

//// : Promise<Array<OutputSessionsType> | null>