import {blogInputData, blogInputPostDat} from "../types/blogType";
import {blogsType} from "../db/dbType";
import {DeleteResult, UpdateResult} from "mongodb";
import {blogsMongooseModel} from "../db/mongooseSchema/mongooseSchema";


export const blogsRepository = {
    /*async findBlogById(id: string): Promise<blogsType | null> {
        return await blogsCollection.findOne({id: id})

    },*/
    async createdBlog(newBlogCreatedData: blogInputPostDat): Promise<blogsType> {


        /* const newBlog = {
             id: String(+(new Date())),
             createdAt: new Date().toISOString(),
             isMembership: false,
             ...newBlogCreatedData
         }
         const result = await blogsCollection.insertOne(newBlog)
         return newBlog*/
        const newBlog = {
            id: String(+(new Date())),
            createdAt: new Date().toISOString(),
            isMembership: false,
            ...newBlogCreatedData
        }


        const smartBlogModel = new blogsMongooseModel(newBlog)
        await smartBlogModel.save()
        return newBlog
    },
    async updateBlog(blogId: string, updateVideoData: blogInputData): Promise<UpdateResult> {
        /* const {name, description, websiteUrl} = updateVideoData

         const updateBlog = {
             name,
             description,
             websiteUrl
         }*/
        //return await blogsCollection.updateOne({id: blogId}, {$set: updateVideoData})
        return blogsMongooseModel.updateOne({id: blogId}, {$set: updateVideoData})

    },
    async deleteBlog(id: string): Promise<DeleteResult> {
        // return await blogsCollection.deleteOne({id: id})
        return blogsMongooseModel.deleteOne({id: id})
    },
}