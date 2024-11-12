import {SETTINGS} from "../../src/settings";
import {fromUTF8ToBase64} from "../../src/midlewares/auth/auth-basic";
import {ObjectId} from "mongodb";
// @ts-ignore
import bcrypt from "bcrypt";
import {getRawAsset} from "node:sea";


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
            createdAt: new Date().toISOString(),
            login: 'user' + i,
            email: 'user' + i + '@mail.ru',
            passwordHash,
            passwordSalt
        })

    }
    return users
}

export async function createOneUser(email: string, login: string, password: string) {


    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, passwordSalt)


    return {
        _id: new ObjectId(),
        createdAt: new Date().toISOString(),
        login: login,
        email: email,
        passwordHash,
        passwordSalt
    }
}