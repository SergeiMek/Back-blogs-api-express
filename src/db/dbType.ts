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
    availableResolutions:  Array<availableResolutions>


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

export type postType = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
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
}