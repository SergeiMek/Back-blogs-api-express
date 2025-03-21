import {Request, Response} from 'express'
import {videoType} from "../db/dbType";
import {availableResolutionsType} from "../db/db";


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
export type inputVideoType ={
    title:string
    author:string
    availableResolutions:availableResolutionsType
}

export type ParamType = {
    id: string
}

export type BodyType = {
    id: number
    title: string
    // ...
}

export type QueryType = {
    search?: string
}
export type videosInputType = {
    title: string
    author: string
    availableResolutions: Array<availableResolutions>
    canBeDownloaded: boolean
    minAgeRestriction: number
}

export type newVideoCreatedDataType ={
    title: string
    author: string
    availableResolutions: Array<availableResolutions>
}


export type OutputErrorsType = {
    errorsMessages: Array<
        {
            message: string
            field: string
        }
    >
}
export type OutputVideoTypeArray = Array<{
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    createdAt: string,
    publicationDate: string,
    availableResolutions: Array<availableResolutions>
}>


export type OutputType = OutputErrorsType | videoType  | OutputVideoTypeArray
export const someController = (
    req: Request<ParamType, OutputType, BodyType, QueryType>,
    res: Response<OutputType>
) => {

}