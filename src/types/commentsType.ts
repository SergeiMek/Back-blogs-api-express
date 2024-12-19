import {ObjectId} from "mongodb";
import {postType} from "../db/dbType";


export type createCommentType = {
    userId: ObjectId
    content: string
    postId: string
}

export type commentType = {
    _id: ObjectId
    content: string
    commentatorInfo: {
        userId: ObjectId
        userLogin: string
    },
    createdAt: string
    postId: string
}

export type outputCommentType = {
    id: ObjectId
    content: string
    commentatorInfo: {
        userId: ObjectId
        userLogin: string
    },
    createdAt: string
}

export type findCommentsData = {
    pageNumber: number
    pageSize: number
    sortBy: string
    sortDirection: string
    postId?: string
}

export type CommentsOutputType = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: outputCommentType[]
}

export type commentsQueryType = {
    sortBy: string | null
    sortDirection: 'asc' | 'desc'
    pageNumber: string | null
    pageSize: string | null
}

export type updateCommentType = {
    userId: ObjectId
    commentId: string
    content: string
}

export class CommentatorInfo {
    constructor(
        public userId: ObjectId,
        public userLogin: string
    ) {
    }
}


export class CommentsBDTypeClass {
    constructor(
        public _id: ObjectId,
        public content: string,
        public createdAt: string,
        public postId: string,
        public commentatorInfo: CommentatorInfo
    ) {
    }
}