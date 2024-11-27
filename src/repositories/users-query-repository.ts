import {usersDBType} from "../db/dbType";
import {usersCollection} from "../db/dbInMongo";
import {usersEntityType, usersOutputType, usersQueryOutputType} from "../types/usersType";
import {ObjectId} from "mongodb";


export const usersQueryRepository = {
    async getAllUsers(data: usersQueryOutputType): Promise<usersOutputType> {
        let filter: any = {}

        if (data.searchEmailTerm || data.searchLoginTerm) {
            filter.$or = []
        }
        if (data.searchEmailTerm) {
            filter.$or.push({email: {$regex: data.searchEmailTerm, $options: "i"}})
        }
        if (data.searchLoginTerm) {
            filter.$or.push({login: {$regex: data.searchLoginTerm, $options: "i"}})
        }


        const findUsers = await usersCollection.find(filter).sort({[data.sortBy]: data.sortDirection === 'asc' ? 1 : -1}).skip((data.pageNumber - 1) * data.pageSize).limit(data.pageSize).toArray()
        const totalCount = await usersCollection.countDocuments(filter)
        const pageCount = Math.ceil(totalCount / data.pageSize)

        return {
            pagesCount: pageCount,
            page: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: totalCount,
            items: this._usersMapping(findUsers)
        }

    },
    async findUserById(id: string): Promise<usersEntityType | null> {
        if (!this._checkObjectId(id)) return null;

        const findUser = await usersCollection.findOne({_id: new ObjectId(id)})
        if (findUser) {
            return {
                id: findUser._id,
                login: findUser.accountData.login,
                email: findUser.accountData.email,
                createdAt: findUser.accountData.createdAt
            }
        } else {
            return null
        }
    },
    _usersMapping(array: usersDBType[]): usersEntityType[] {
        return array.map((user) => {
            return {
                id: user._id,
                login: user.accountData.login,
                email: user.accountData.email,
                createdAt: user.accountData.createdAt
            };
        });
    },
    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }

}