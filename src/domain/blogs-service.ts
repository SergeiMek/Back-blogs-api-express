import {blogsDBType, blogsType} from "../db/dbType";
import {blogsRepository} from "../repositories/blogs-repository";
import {blogInputData, blogInputPostDat} from "../types/blogType";


export const blogsService = {
    async getAllBlogs(): Promise<blogsType[]> {
        const blogs =  await blogsRepository.getAllBlogs()
        return this._blogMapping(blogs)
    },
    async findBlogById(id: string): Promise<blogsType | null> {
        const blog = await blogsRepository.findBlogById(id)
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
        const result = await blogsRepository.createdBlog(newBlog)
        // @ts-ignore
        delete newBlog._id
        return newBlog
    },
    async updateBlog(blogId: string, updateVideoData: blogInputData): Promise<boolean> {

        const result = await blogsRepository.updateBlog(blogId, updateVideoData)

        return result.matchedCount === 1
    },
    async deleteBlog(id: string): Promise<boolean> {
        const result = await blogsRepository.deleteBlog(id)
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