import {blogInputData, blogInputPostDat} from "../types/blogType";
import {blogsCollection} from "../db/dbInMongo";
import {blogsDBType, blogsType} from "../db/dbType";
import {DeleteResult, UpdateResult} from "mongodb";


export const blogsRepository = {
    async getAllBlogs(): Promise<blogsDBType[]> {
        return await blogsCollection.find().toArray()

    },
    async findBlogById(id: string): Promise<blogsType | null> {
        return await blogsCollection.findOne({id: id})

    },
    async createdBlog(newBlogCreatedData: blogInputPostDat): Promise<blogsType> {

        let {name, description, websiteUrl} = newBlogCreatedData

        const newBlog = {
            id: String(+(new Date())),
            createdAt: new Date().toISOString(),
            isMembership: false,
            /*name,
            description,
            websiteUrl,*/
            ...newBlogCreatedData
        }
        const result = await blogsCollection.insertOne(newBlog)
        return newBlog

    },
    async updateBlog(blogId: string, updateVideoData: blogInputData): Promise<UpdateResult> {
        /* const {name, description, websiteUrl} = updateVideoData

         const updateBlog = {
             name,
             description,
             websiteUrl
         }*/
        return await blogsCollection.updateOne({id: blogId}, {$set: updateVideoData})


    },
    async deleteBlog(id: string): Promise<DeleteResult> {
        return  await blogsCollection.deleteOne({id: id})


    },
    /*async _blogMapping(array: blogsDBType[]): Promise<blogsType[]> {
        return array.map((blog) => {
            return {
                id: blog.id,
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership
            };
        });
    }*/

}