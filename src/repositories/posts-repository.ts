import {postsInoutData} from "../types/postType";
import {postDBType, postType} from "../db/dbType";
import {DeleteResult, UpdateResult} from "mongodb";
import {postsMongooseModel} from "../db/mongooseSchema/mongooseSchema";


export const postsRepository = {

    async createdPost(newPostCreatedData: postType): Promise<postType> {

        /* const result = await postsCollection.insertOne(newPostCreatedData)
         return newPostCreatedData*/

        const smartUserModel = new postsMongooseModel(newPostCreatedData);
        await smartUserModel.save();
        return newPostCreatedData
    },
    async findPostById(id: string): Promise<postDBType | null> {
        //return await postsCollection.findOne({id: id})
        return  postsMongooseModel.findOne({id: id})

    },
    async updatePost(postId: string, updatePostData: postsInoutData): Promise<UpdateResult> {
        return  postsMongooseModel.updateOne({id: postId}, {$set: updatePostData})
    },
    async deletePost(id: string): Promise<DeleteResult> {
        return postsMongooseModel.deleteOne({id: id})

    }
}