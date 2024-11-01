import {blogsType, videoType} from "../db/dbType";
import {Request, Response} from "express";
import {BodyType, OutputErrorsType, ParamType, QueryType} from "./videosType";

export type blogInputPostDat = {
    name: string
    description: string
    websiteUrl: string

}

export type blogInputData = {
    name: string
    description: string
    websiteUrl: string

}

export type blogInputPostData ={
    title: string
    shortDescription: string
    content: string
}


export type PostInputModel = {
    title: string // max 30
    shortDescription: string // max 100
    content: string // max 1000
    blogId: string // valid
}

export type blogQueryOutputType = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: blogsType[]
}

export type blogQueryBlogType = {
    searchNameTerm?: string | null
    sortBy: string | null
    sortDirection: 'asc' | 'desc'
    pageNumber: string | null
    pageSize: string | null
}

/*export type blogQueryIdType = {
    pageNumber: number | null
    pageSize: number | null
    sortBy: string | null
    sortDirection: 'asc' | 'desc'
}*/


export type blogDataFindType = {
    searchNameTerm: string | null
    sortBy: string
    sortDirection: string
    pageNumber: number
    pageSize: number
}


export type OutputBlogsTypeArray = Array<blogsType>


export type OutputBlogsType = OutputErrorsType | blogsType | OutputBlogsTypeArray | blogQueryOutputType

