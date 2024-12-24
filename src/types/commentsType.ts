import {ObjectId} from "mongodb";
import {likeStatus, postType} from "../db/dbType";


export type createCommentType = {
    userId: ObjectId
    content: string
    postId: string
}

/*export type commentType = {
    _id: ObjectId
    content: string
    commentatorInfo: {
        userId: ObjectId
        userLogin: string
    },
    createdAt: string
    postId: string
}*/

export type outputCreateCommentData ={
    id: ObjectId
    content:string
    commentatorInfo: {
        userId: ObjectId
        userLogin: string
    },
    createdAt: string,
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus:string
    }
}

/*export type outputCommentType = {
    id: ObjectId
    content: string
    commentatorInfo: {
        userId: ObjectId
        userLogin: string
    },
    createdAt: string
}*/

export type findCommentsData = {
    pageNumber: number
    pageSize: number
    sortBy: string
    sortDirection: string
    postId?: string
    userId?:ObjectId
}

export type CommentsOutputType = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: outputCreateCommentData[]
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
export type updateLikeStatusType = {
    userId: ObjectId
    commentId: string
    likeStatus: string
}

export class CommentatorInfo {
    constructor(
        public userId: ObjectId,
        public userLogin: string
    ) {
    }
}

export class UserForCommentLike {
    constructor(
        public userId: ObjectId,
        public likeStatus: string
    ) {
    }

}


export class LikesInfo {
    constructor(
        public likesCount: number,
        public dislikesCount: number,
        public users: Array<UserForCommentLike>
    ) {
    }
}


export class CommentsBDTypeClass {
    constructor(
        public _id: ObjectId,
        public content: string,
        public createdAt: string,
        public postId: string,
        public commentatorInfo: CommentatorInfo,
        public likesInfo: LikesInfo
    ) {
    }
}

