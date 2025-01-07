import {ObjectId} from "mongodb";


enum availableResolutions {
    "P144",
    "P240",
    "P360",
    "P480",
    "P720",
    "P1080",
    "P1440",
    "P2160"
}

export enum likeStatus {
    "None",
    "Like",
    "Dislike"
}

/*
const availableResolutions = ["P144",
    "P240",
    "P360",
    "P480",
    "P720",
    "P1080",
    "P1440",
    "P2160"]
*/
/*

type availableResolutions = Array<"P144" |
    "P240" |
    "P360" |
    "P480" |
    "P720" |
    "P1080" |
    "P1440" |
    "P2160">

*/

export type videoType = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    createdAt: string,
    publicationDate: string,
    availableResolutions: Array<availableResolutions>


}

export type videoDBType = {
    _id: ObjectId
    id: number
    title: string
    author: string
    canBeDownloaded: boolean
    minAgeRestriction: number | null
    createdAt: string
    publicationDate: string
    availableResolutions: Array<availableResolutions>

}

export type blogsType = {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type blogsDBType = {
    _id: ObjectId
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}
type likInfoUsers = {
    addedAt: string
    userId: string
    userLogin: string
    likeStatus: string
}
type newestLikes = {
    addedAt: string
    userId: string
    login: string
}

type likeInfoPostType = {
    likesCount: number,
    dislikesCount: number,
    users: Array<likInfoUsers>

}
type outputLikeInfoPostType = {
    likesCount: number,
    dislikesCount: number,
    myStatus: string,
    newestLikes: Array<newestLikes>

}

export type postType = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    likesInfo: likeInfoPostType
}
export type outputPostType = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    extendedLikesInfo: outputLikeInfoPostType
}

export type postDBType = {
    _id: ObjectId
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    likesInfo: likeInfoPostType
}

type likeInfoCommentType = {
    likesCount: number
    dislikesCount: number
    users: Array<{ userId: ObjectId, likeStatus: string }>
}


export type commentsDBType = {
    _id: ObjectId
    content: string
    commentatorInfo: {
        userId: ObjectId
        userLogin: string
    }
    createdAt: string,
    postId: string,
    likesInfo: likeInfoCommentType

}

export type usersDBType = {
    _id: ObjectId,
    accountData: {
        login: string
        email: string
        passwordHash: string
        passwordSalt: string
        createdAt: string
    }
    emailConfirmation: {
        confirmationCode: string | null
        expirationData: Date | null
        isConfirmed: boolean
    }
    passwordRecovery: {
        recoveryCode: string | null
        expirationDate: Date | null
    }
}

export type deviceDBType = {
    _id: ObjectId
    ip: string
    title: string
    userId: string
    deviceId: string
    lastActiveDate: number
    expirationDate: number
}
export type blackListType = {
    _id: ObjectId
    token: string
}

export type rateLimitType = {
    _id: ObjectId
    ip: string
    URL: string
    date: number
}
