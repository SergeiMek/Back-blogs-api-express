import {blogsDBType, blogsType} from "../db/dbType";
import {blogsRepository} from "../repositories/blogs-repository";
import {BlogDBTypeClass, blogInputData, blogInputPostDat} from "../types/blogType";


class BlogsService{
    async createdBlog(newBlogCreatedData: blogInputPostDat): Promise<blogsType> {

        let {name, description, websiteUrl} = newBlogCreatedData

        const newBlog :BlogDBTypeClass = new BlogDBTypeClass(String(+(new Date())),new Date().toISOString(),false,name,description,websiteUrl)

        const result = await blogsRepository.createdBlog(newBlog)
        // @ts-ignore
        delete newBlog._id
        return newBlog
    }
    async updateBlog(blogId: string, updateVideoData: blogInputData): Promise<boolean> {

        const result = await blogsRepository.updateBlog(blogId, updateVideoData)

        return result.matchedCount === 1
    }
    async deleteBlog(id: string): Promise<boolean> {
        const result = await blogsRepository.deleteBlog(id)
        return result.deletedCount === 1

    }
}

export const blogsService = new BlogsService()

