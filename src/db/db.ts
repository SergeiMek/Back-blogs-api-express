import {blogsType, postType, videoType} from "./dbType";
import {getRawAsset} from "node:sea";
import {blogsCollection, postsCollection, videosCollection} from "./dbInMongo";

export type DBType = {
    videos: videoType[]
    blogs: blogsType[]
    posts: postType[]
}

export type ReadonlyDBType = { // тип для dataset
    blogs: Readonly<blogsType[]>
    posts: Readonly<postType[]>
    videos: Readonly<videoType[]>
    // some: any[]
}

export const db: DBType = {
    videos: [],
    blogs: [],
    posts: []
}

export type availableResolutionsType = typeof availableResolutions
export const availableResolutions = ["P144",
    "P240",
    "P360",
    "P480",
    "P720",
    "P1080",
    "P1440",
    "P2160"]
// функция для быстрой очистки/заполнения базы данных для тестов
/*export const setDB = (dataset?: Partial<ReadonlyDBType>) => {
    if (!dataset) { // если в функцию ничего не передано - то очищаем базу данных
        db.blogs = []
        db.posts = []
        db.videos = []
        return
    }

    // если что-то передано - то заменяем старые значения новыми
    db.blogs = dataset.blogs?.map(b => ({...b})) || db.blogs
    db.posts = dataset.posts?.map(p => ({...p})) || db.posts
    db.videos = dataset.videos?.map(v => ({...v})) || db.videos

}*/

export const deleteDB = async () => {
        await videosCollection.deleteMany({})
        await postsCollection.deleteMany({})
        await blogsCollection.deleteMany({})
}
