import mongoose, {Schema} from "mongoose";
import {
    blogsType,
    commentsDBType,
    deviceDBType,
    likeStatus,
    postType,
    rateLimitType,
    usersDBType,
    videoType
} from "../dbType";
import {ObjectId, WithId} from "mongodb";


const videosSchema = new mongoose.Schema<WithId<videoType>>({
    id: {type: Number, required: true},
    title: {type: String, required: true},
    author: {type: String, required: true},
    canBeDownloaded: {type: Boolean, required: true},
    minAgeRestriction: {type: Number},
    createdAt: {type: String, required: true},
    publicationDate: {type: String, required: true},
    availableResolutions: ["P144", "P240", "P360", "P480", "P720", "P1080", "P1440", "P2160"]
}, {versionKey: false})


const postsSchema = new mongoose.Schema<WithId<postType>>({
    id: {type: String, required: true},
    title: {type: String, required: true},
    shortDescription: {type: String},
    content: {type: String, required: true},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true},
    createdAt: {type: String, required: true},
    likesInfo:{
        likesCount: {type: Number, required: true},
        dislikesCount:{type: Number, required: true},
        users:[
            {
                addedAt:String,
                userId:String,
                userLogin:String,
                likeStatus:String
            }
        ]
    }
}, {versionKey: false})

const blogsSchema = new mongoose.Schema<WithId<blogsType>>({
    id: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: String, required: true},
    isMembership: {type: Boolean, required: true},
}, {versionKey: false})

const usersSchema = new mongoose.Schema<WithId<usersDBType>>({
    accountData: {
        login: {type: String, required: true, unique: true},
        email: {type: String, required: true},
        passwordHash: {type: String, required: true, unique: true},
        passwordSalt: {type: String, required: true},
        createdAt: {type: String, required: true},
    },
    emailConfirmation: {
        confirmationCode: String,
        expirationData: Date,
        isConfirmed: {type: Boolean, required: true}
    },
    passwordRecovery: {
        recoveryCode: String,
        expirationDate: Date
    }
}, {versionKey: false})

const commentSchema = new mongoose.Schema<WithId<commentsDBType>>({
    content: {type: String, required: true},
    commentatorInfo: {
        userId: ObjectId,
        userLogin: {type: String, required: true},
    },
    createdAt: {type: String, required: true},
    postId: {type: String, required: true},
    likesInfo: {
        likesCount: {type: Number, required: true},
        dislikesCount: {type: Number, required: true},
        users: [{userId: String, likeStatus: String}],
    }
}, {versionKey: false})

const deviceSchema = new mongoose.Schema<WithId<deviceDBType>>({
    ip: {type: String, required: true},
    title: {type: String, required: true},
    userId: {type: String, required: true},
    deviceId: {type: String, required: true},
    lastActiveDate: {type: Number, required: true},
    expirationDate: {type: Number, required: true},
}, {versionKey: false})

const rateLimitSchema = new mongoose.Schema<WithId<rateLimitType>>({
    ip: {type: String, required: true},
    URL: {type: String, required: true},
    date: {type: Number, required: true},
}, {versionKey: false})


export const videosMongooseModel = mongoose.model('videos', videosSchema)
export const postsMongooseModel = mongoose.model('posts', postsSchema)
export const blogsMongooseModel = mongoose.model('blogs', blogsSchema)
export const usersMongooseModel = mongoose.model('users', usersSchema)
export const commentsMongooseModel = mongoose.model('comments', commentSchema)
export const devicesMongooseModel = mongoose.model('device', deviceSchema)
export const limitsMongooseModel = mongoose.model('limit', rateLimitSchema)


export async function deleteDB() {
    await videosMongooseModel.deleteMany()
    await postsMongooseModel.deleteMany()
    await blogsMongooseModel.deleteMany()
    await usersMongooseModel.deleteMany()
    await commentsMongooseModel.deleteMany()
    await devicesMongooseModel.deleteMany()
    await limitsMongooseModel.deleteMany()
}