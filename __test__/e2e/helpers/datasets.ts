import {SETTINGS} from "../../../src/settings";
import {fromUTF8ToBase64} from "../../../src/midlewares/auth/auth-basic";
import {ObjectId} from "mongodb";
// @ts-ignore
import bcrypt from "bcrypt";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
// @ts-ignore
import jwt from "jsonwebtoken"
import {usersDBType} from "../../../src/db/dbType";
import {
    blogsMongooseModel, commentsMongooseModel, devicesMongooseModel,
    postsMongooseModel,
    usersMongooseModel
} from "../../../src/db/mongooseSchema/mongooseSchema";


export const createString = (length: number) => {
    let s = ''
    for (let x = 1; x <= length; x++) {
        s += x % 10
    }
    return s
}


export const codedAuth = fromUTF8ToBase64(SETTINGS.ADMIN)


export const blog1/*: BlogDbType*/ = {
    id: String(+(new Date())),
    name: 'n1',
    description: 'd1',
    websiteUrl: 'https://some.com',
} as const // dataset нельзя изменять
// blog1.name = 'n2' // error!!!

export const blog7/*: BlogDbType*/ = {
    id: new Date().toISOString() + Math.random(),
    name: 'n7',
    description: 'd7',
    websiteUrl: 'http://some7.com',
} as const // dataset нельзя изменять

export const post1/*: PostDbType*/ = {
    id: new Date().toISOString() + Math.random(),
    title: 't1',
    content: 'c1',
    shortDescription: 's1',
    blogId: blog1.id,
    blogName: 'n1'
} as const // dataset нельзя изменять

// ...

export const dataset1/*: DBType*/ = {
    blogs: [blog1],
    posts: [],
    videos: []
} as const // dataset нельзя изменять
export const dataset2/*: DBType*/ = {
    blogs: [blog1, blog7],
    posts: [post1],
    videos: []
} as const // dataset нельзя изменять
// dataset2.blogs = [] // error!!!
// dataset2.blogs.push(blog1) // runtime error!!!
// dataset2.blogs[0].name = 'n3' // error!!!

// ...


export async function createUsers(count: number) {
    const users = []

    for (let i = 0; i < count; i++) {
        let password = Math.floor(100000 + Math.random() * (1000000000000000 + 1 - 100000))

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(String(password), passwordSalt)


        users.push({
            _id: new ObjectId(),
            accountData: {
                createdAt: new Date().toISOString(),
                login: 'user' + i,
                email: 'user' + i + '@mail.ru',
                passwordHash,
                passwordSalt
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationData: add(new Date(), {hours: 1}),  //// v   add(new Date(), {hours: 1})
                isConfirmed: true
            }
        })

    }
    return users
}

export async function createOneUser(email: string, login: string, password: string) {


    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, passwordSalt)


    return {
        _id: new ObjectId(),
        accountData: {
            createdAt: new Date().toISOString(),
            login: login,
            email: email,
            passwordHash,
            passwordSalt
        },
        emailConfirmation: {
            confirmationCode: uuidv4(),
            expirationData: add(new Date(), {hours: 1}),  //// v   add(new Date(), {hours: 1})
            isConfirmed: false
        },
        passwordRecovery:{
            recoveryCode:null,
            expirationDate:null
        }
    }
}

type userLoginDataType = {
    login: string
    password: string
    email: string
    confirmationCode: string
    isConfirmed: boolean
}


export async function createOneUserRegistration(data: userLoginDataType) {


    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(data.password, passwordSalt)


    return {
        _id: new ObjectId(),
        accountData: {
            createdAt: new Date().toISOString(),
            login: data.login,
            email: data.email,
            passwordHash,
            passwordSalt
        },
        emailConfirmation: {
            confirmationCode: data.confirmationCode,
            expirationData: add(new Date(), {hours: 1}),  //// v   add(new Date(), {hours: 1})
            isConfirmed: data.isConfirmed
        }
    }
}


type dataCreateCommentData = {
    content: string
    emailUser: string
    loginUser: string
    passwordUser: string

}

export async function createComment(data: dataCreateCommentData) {
    const datasetBlog = {
        id: String(+(new Date())),
        name: 'n1',
        description: 'd1',
        websiteUrl: 'https://some.com',
        isMembership: false,
        createdAt: new Date().toISOString()
    }

    const posts = [...new Array(1)].map((_, index) => ({
        id: String(+(new Date())),
        title: 't1',
        content: 'c1',
        shortDescription: 's1',
        blogId: datasetBlog.id,
        blogName: 'n1',
        createdAt: new Date().toISOString()
    }))
    const user = await createOneUser(data.emailUser, data.loginUser, data.passwordUser)
    await blogsMongooseModel.create(datasetBlog)
    await postsMongooseModel.insertMany(posts)
    await usersMongooseModel.create(user)
    const comment = {
        _id: new ObjectId,
        content: data.content,
        commentatorInfo: {
            userId: user._id,
            userLogin: user.accountData.login
        },
        createdAt: new Date().toISOString(),
        postId: posts[0].id
    }
    await commentsMongooseModel.create(comment)
    return {
        commentId: comment._id,
        userLogin: user.accountData.login,
        userPassword: data.passwordUser,
        userEmail: user.accountData.email,
        postId: posts[0].id
    }
}

type loginUsertype = {
    user: usersDBType,
    ip: string,
    userAgent: string,
    refreshToken: string,
    timeData: number
}


export const loginUser = async (data: loginUsertype) => {


    const now = new Date()
    const dataIat = new Date(now.getTime() + 30 * data.timeData)
    const dataExp = new Date(new Date(now.getTime() + 30 * 1000))

    const newDevice = {
        _id: new ObjectId,
        ip: data.ip,
        title: data.userAgent,
        userId: data.user._id.toString(),
        deviceId: uuidv4(),
        lastActiveDate: Number(dataIat),
        expirationDate: Number(dataExp)
    }


    await devicesMongooseModel.create(newDevice)

    /*return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }*/
    return {
        refreshToken: data.refreshToken, refreshData: {
            userId: data.user._id.toString(),
            deviceId: uuidv4(),
            lastActiveDate: Number(dataIat),
            expirationDate: Number(dataExp)

        }



}}




