import {ObjectId} from "mongodb";


export class RareLimitDBClassType {
    constructor(
        public _id: ObjectId,
        public ip: string,
        public URL: string,
        public date: number
    ) {
    }
}