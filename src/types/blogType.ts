import {blogsType, videoType} from "../db/dbType";
import {Request, Response} from "express";
import {BodyType, OutputErrorsType,  ParamType, QueryType} from "./videosType";

export type blogInputPostDat = {
    name: string
    description: string
    websiteUrl: string
}

export type blogInputData = {
    name: string
    description:string
    websiteUrl:string
}

export type PostInputModel = {
    title: string // max 30
    shortDescription: string // max 100
    content: string // max 1000
    blogId: string // valid
}



export type OutputBlogsTypeArray = Array<blogsType>


export type OutputBlogsType = OutputErrorsType | blogsType| OutputBlogsTypeArray

