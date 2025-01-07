import {OutputErrorsType} from "./videosType";
import {blogsType, outputPostType, postType} from "../db/dbType";
import {ObjectId} from "mongodb";


export type postsInoutData = {
    title: string
    shortDescription: string
    content: string
    blogId: string
}

export type pushUserInLikeType = {
    postId:string
    addedAt: string
    userId: ObjectId
    userLogin: string
    likeStatus: string
}


export type updateLikesDataType = {
    postId: string
    userId: ObjectId
    likeStatus: string
}

export type findPostData = {
    pageNumber: number
    pageSize: number
    sortBy: string
    sortDirection: string
    blogId?: string
    userId?: ObjectId
}

export type postOutputType = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: outputPostType[]
}

export class ExtendedUserLikes {
    constructor(
        public addedAt: string,
        public userId: string,
        public userLogin: string,
        public likeStatus: string
    ) {
    }
}

export class PostDBModel {
    constructor(
        public _id: ObjectId,
        public id: string,
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string,
        public createdAt: string,
        public likesInfo: {
            likesCount: number,
            dislikesCount: number,
            users: ExtendedUserLikes[]
        }
    ) {
    }
}

type OutputPostsTypeArray = Array<postType>


export type OutputPostsType = OutputErrorsType | postType | OutputPostsTypeArray | postOutputType