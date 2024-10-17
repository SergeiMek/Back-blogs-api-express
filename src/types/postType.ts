import {OutputErrorsType} from "./videosType";
import {postType} from "../db/dbType";


export type postsInoutData = {
    title: string
    shortDescription: string
    content: string
    blogId: string
}

type OutputPostsTypeArray = Array<postType>


export type OutputPostsType = OutputErrorsType | postType | OutputPostsTypeArray