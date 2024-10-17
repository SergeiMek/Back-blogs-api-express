import {db} from "../db/db";
import {blogInputPostDat, blogInputData} from "../types/blogType";


export const blogsRepository = {
    getAllBlogs() {

        return db.blogs
    },
    findBlogById(id: string) {
        return db.blogs.find(b => b.id === id)
    },
    createdBlog(newBlogCreatedData: blogInputPostDat) {

        let {name, description, websiteUrl} = newBlogCreatedData

        const newBlog = {
            id: String(+(new Date())),
            name,
            description,
            websiteUrl

        }
        db.blogs.push(newBlog)
        return newBlog
    },
    updateBlog(blogId: string, updateVideoData: blogInputData) {
        const blog = this.findBlogById(blogId)
        if (blog) {
            blog.name = updateVideoData.name
            blog.description = updateVideoData.description
            blog.websiteUrl = updateVideoData.websiteUrl

            return true
        } else {
            return false
        }
    },
    deleteBlog(id: string) {

        for (let i = 0; i < db.blogs.length; i++) {
            if (db.blogs[i].id === id) {
                db.blogs.splice(i, 1);
                return true
            }
        }
            return false

    }

}