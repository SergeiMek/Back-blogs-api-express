import {blogInputData, blogInputPostDat} from "../types/blogType";
import {blogsType} from "../db/dbType";
import {DeleteResult, UpdateResult} from "mongodb";
import {blogsMongooseModel} from "../db/mongooseSchema/mongooseSchema";
import { injectable } from "inversify";

@injectable()
export class BlogsRepository {
    async createdBlog(newBlogCreatedData: blogInputPostDat): Promise<blogsType> {

        const newBlog = {
            id: String(+(new Date())),
            createdAt: new Date().toISOString(),
            isMembership: false,
            ...newBlogCreatedData
        }


        const smartBlogModel = new blogsMongooseModel(newBlog)
        await smartBlogModel.save()
        return newBlog
    }

    async updateBlog(blogId: string, updateVideoData: blogInputData): Promise<UpdateResult> {
        return blogsMongooseModel.updateOne({id: blogId}, {$set: updateVideoData})
    }

    async findBlogById(blogId:string){
        return blogsMongooseModel.findOne({id: blogId})
    }

    async deleteBlog(id: string): Promise<DeleteResult> {
        // return await blogsCollection.deleteOne({id: id})
        return blogsMongooseModel.deleteOne({id: id})
    }
}



