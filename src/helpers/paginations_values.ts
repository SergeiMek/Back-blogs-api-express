import {Request} from 'express'
import {blogQueryBlogType} from "../types/blogType";

export const paginationQueries = (req: Request<{}, {}, {}, blogQueryBlogType>) => {
    let searchNameTerm = req.query.searchNameTerm ? String(req.query.searchNameTerm) : null
    let sortBy = req.query.sortBy ? String(req.query.sortBy) : 'createdAt'
    let sortDirection = req.query.sortDirection && req.query.sortDirection.toString() === 'asc' ? 'asc' : 'desc'
    let pageNumber = req.query.pageNumber ? +req.query.pageNumber : 1
    let pageSize = req.query.pageSize ? +req.query.pageSize : 10


    return {searchNameTerm, sortBy, sortDirection, pageNumber, pageSize}

}