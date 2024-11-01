import {OutputErrorsType} from "./videosType";
import {blogsType, postType} from "../db/dbType";


export type postsInoutData = {
    title: string
    shortDescription: string
    content: string
    blogId: string
}


export type findPostData = {
    pageNumber:number
    pageSize:number
    sortBy:string
    sortDirection:string
    blogId?:string
}

export type postOutputType = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: postType[]
}



type OutputPostsTypeArray = Array<postType>


export type OutputPostsType = OutputErrorsType | postType | OutputPostsTypeArray | postOutputType