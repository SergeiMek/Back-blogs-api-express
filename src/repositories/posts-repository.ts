import {findPostData, postsInoutData} from "../types/postType";
import {blogsRepository} from "./blogs-repository";
import {postDBType, postType} from "../db/dbType";
import {postsCollection} from "../db/dbInMongo";
import {DeleteResult, UpdateResult} from "mongodb";


export const postsRepository = {

    async createdPost(newPostCreatedData: postType): Promise<postType> {

        const result = await postsCollection.insertOne(newPostCreatedData)
        return  newPostCreatedData

    },
    async updatePost(postId: string, updatePostData: postsInoutData): Promise<UpdateResult > {


        return  await postsCollection.updateOne({id: postId}, {$set: updatePostData})

    },
    async deletePost(id: string): Promise<DeleteResult> {
        return  postsCollection.deleteOne({id: id})



    }
}