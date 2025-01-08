import {blogsType} from "../db/dbType";
import {BlogsRepository} from "../repositories/blogs-repository";
import {BlogDBTypeClass, blogInputData, blogInputPostDat} from "../types/blogType";
import { injectable } from "inversify";
import {inject} from "inversify";

@injectable()
export class BlogsService{

    constructor(@inject(BlogsRepository) protected blogsRepository:BlogsRepository) {}

    async createdBlog(newBlogCreatedData: blogInputPostDat): Promise<blogsType> {

        let {name, description, websiteUrl} = newBlogCreatedData

        const newBlog :BlogDBTypeClass = new BlogDBTypeClass(String(+(new Date())),new Date().toISOString(),false,name,description,websiteUrl)

        const result = await this.blogsRepository.createdBlog(newBlog)
        // @ts-ignore
        delete newBlog._id
        return newBlog
    }
    async updateBlog(blogId: string, updateVideoData: blogInputData): Promise<boolean> {

        const result = await this.blogsRepository.updateBlog(blogId, updateVideoData)

        return result.matchedCount === 1
    }
    async deleteBlog(id: string): Promise<boolean> {
        const result = await this.blogsRepository.deleteBlog(id)
        return result.deletedCount === 1

    }
}



