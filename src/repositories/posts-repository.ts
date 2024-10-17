import {db} from "../db/db";
import {blogInputPostDat, blogInputData} from "../types/blogType";
import {postsInoutData} from "../types/postType";
import {blogsRepository} from "./blogs-repository";


export const postsRepository = {
    getAllPosts() {

        return db.posts
    },
    findPostById(id: string) {
        return db.posts.find(b => b.id === id)
    },
    createdPost(newPostCreatedData: postsInoutData) {

        let {title, shortDescription, content, blogId} = newPostCreatedData

        const blog = blogsRepository.findBlogById(blogId)
        if (blog) {
            const newPost = {
                id: String(+(new Date())),
                title,
                shortDescription,
                content,
                blogId,
                blogName: blog.name
            }
            db.posts.push(newPost)
            return newPost
        }
        return
    },
    updatePost(postId: string, updatePostData: postsInoutData) {

        let {title, shortDescription, content, blogId} = updatePostData
        const blog = blogsRepository.findBlogById(blogId)
        const post = this.findPostById(postId)
        if (post) {
            post.title = title
            post.shortDescription = shortDescription
            post.content = content
            post.blogId = blogId
            post.blogName = blog ? blog.name : ''
            return true
        } else {
            return false
        }
    },
    deletePost(id: string) {

        for (let i = 0; i < db.posts.length; i++) {
            if (db.posts[i].id === id) {
                db.posts.splice(i, 1);
                return true
            }
        }
        return false

    }

}