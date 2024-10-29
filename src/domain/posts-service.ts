import {postsInoutData} from "../types/postType";
import {postDBType, postType} from "../db/dbType";
import {postsRepository} from "../repositories/posts-repository";
import {blogsRepository} from "../repositories/blogs-repository";


export const postsService = {
    async getAllPosts(): Promise<postType[]> {
        const posts = await postsRepository.getAllPosts()
        return this._postMapping(posts)
    },
    async findPostById(id: string): Promise<postType | null> {
        const post = await postsRepository.findPostById(id)

        if (post) {
            return {
                id: post.id,
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt
            }
        } else {
            return null
        }
    },
    async createdPost(newPostCreatedData: postsInoutData): Promise<postType> {

        //let {title, shortDescription, content,blogId} = newPostCreatedData

        const blog = await blogsRepository.findBlogById(newPostCreatedData.blogId)

        const newPost = {
            id: String(+(new Date())),
            createdAt: new Date().toISOString(),
            blogName: blog!.name,
            ...newPostCreatedData
        }

        const result = await postsRepository.createdPost(newPost)
        // @ts-ignore
        delete newPost._id

        return newPost


    },
    async updatePost(postId: string, updatePostData: postsInoutData): Promise<boolean> {

        let {title, shortDescription, content, blogId} = updatePostData
        //const blog = await blogsRepository.findBlogById(blogId)

        const updatePost = {
            title: title,
            shortDescription: shortDescription,
            content: content,
            blogId: blogId,
            //blogName: blog?.name
        }
        const result = await postsRepository.updatePost(postId,updatePost)
        return result.matchedCount === 1
    },
    async deletePost(id: string): Promise<boolean> {
        const result = await postsRepository.deletePost(id)

        return result.deletedCount === 1

    },
    async _postMapping(array: postDBType[]): Promise<postType[]> {
        return array.map((post) => {
            return {
                id: post.id,
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt
            };
        });
    }

}