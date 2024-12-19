import {ObjectId} from "mongodb";

export type DeviceViewModel = {
    ip: string;
    title: string;
    lastActiveDate: string;
    deviceId: string;
};

export class deviseDBClassType {
    constructor(
        public _id: ObjectId,
        public ip: string,
        public title: string,
        public userId: string,
        public deviceId: string,
        public lastActiveDate: number,
        public expirationDate: number
    ) {
    }
}