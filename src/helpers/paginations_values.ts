import {Request} from 'express'
import {blogQueryBlogType} from "../types/blogType";
import {usersQueryOutputType, usersQueryType} from "../types/usersType";

export const paginationQueries = (req: Request<{}, {}, {}, blogQueryBlogType>) => {
    let searchNameTerm = req.query.searchNameTerm ? String(req.query.searchNameTerm) : null
    let sortBy = req.query.sortBy ? String(req.query.sortBy) : 'createdAt'
    let sortDirection = req.query.sortDirection && req.query.sortDirection.toString() === 'asc' ? 'asc' : 'desc'
    let pageNumber = req.query.pageNumber ? +req.query.pageNumber : 1
    let pageSize = req.query.pageSize ? +req.query.pageSize : 10


    return {searchNameTerm, sortBy, sortDirection, pageNumber, pageSize}

}

export const paginationUsersQueries = (req: Request<{}, {}, {}, usersQueryType>): usersQueryOutputType => {
    let sortBy = req.query.sortBy ? String(req.query.sortBy) : 'createdAt'
    let sortDirection: 'asc' | 'desc' = req.query.sortDirection && req.query.sortDirection.toString() === 'asc' ? 'asc' : 'desc'
    let pageNumber = req.query.pageNumber ? +req.query.pageNumber : 1
    let pageSize = req.query.pageSize ? +req.query.pageSize : 10
    let searchLoginTerm = req.query.searchLoginTerm ? String(req.query.searchLoginTerm) : null
    let searchEmailTerm = req.query.searchEmailTerm ? String(req.query.searchEmailTerm) : null


    return {sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm}

}