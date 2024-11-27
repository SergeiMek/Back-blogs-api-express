import {OutputErrorsType} from "./output-errors-type";
import {ObjectId} from "mongodb";


export type usersQueryType = {
    sortBy?: string | null
    sortDirection?: 'asc' | 'desc'
    pageNumber?: string | null
    pageSize?: string | null
    searchLoginTerm?: string | null
    searchEmailTerm?: string | null
}

export type usersQueryOutputType = {
    sortBy: string
    sortDirection: 'asc' | 'desc'
    pageNumber: number
    pageSize: number
    searchLoginTerm: string | null
    searchEmailTerm: string | null
}

export type usersEntityType = {
    id: ObjectId
    login: string
    email: string
    createdAt: string
}


export type usersOutputType = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: usersEntityType[]
}

export type userInputType = {
    login: string
    password: string
    email: string
}

/*
export type userInputRepositoryType = {
    _id: ObjectId,
    createdAt: Date,
    login: string,
    email: string,
    passwordSalt: string,
    passwordHash: string
}
*/
