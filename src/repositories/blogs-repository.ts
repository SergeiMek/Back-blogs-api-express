import {blogInputData, blogInputPostDat} from "../types/blogType";
import {blogsCollection} from "../db/dbInMongo";
import {blogsDBType, blogsType} from "../db/dbType";


export const blogsRepository = {
    async getAllBlogs(): Promise<blogsType[]> {
        const blogs = await blogsCollection.find().toArray()
        return this._blogMapping(blogs)
    },
    async findBlogById(id: string): Promise<blogsType | null> {
        const blog = await blogsCollection.findOne({id: id})
        if (blog) {
            return {
                id: blog.id,
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership
            }
        } else {
            return null
        }
    },
    async createdBlog(newBlogCreatedData: blogInputPostDat): Promise<blogsType> {

        let {name, description, websiteUrl} = newBlogCreatedData

        const newBlog = {
            id: String(+(new Date())),
            createdAt: new Date().toISOString(),
            isMembership: false,
            name,
            description,
            websiteUrl,
        }
        const result = await blogsCollection.insertOne(newBlog)
        // @ts-ignore
        delete newBlog._id
        return newBlog
    },
    async updateBlog(blogId: string, updateVideoData: blogInputData): Promise<boolean> {
        const {name, description, websiteUrl} = updateVideoData

        const updateBlog = {
            name,
            description,
            websiteUrl
        }

        const result = await blogsCollection.updateOne({id: blogId}, {$set: updateBlog})

        return result.matchedCount === 1
    },
    async deleteBlog(id: string): Promise<boolean> {
        const result = await blogsCollection.deleteOne({id: id})
        return result.deletedCount === 1

    },
    async _blogMapping(array: blogsDBType[]): Promise<blogsType[]> {
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
    }

}