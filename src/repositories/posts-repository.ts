import {postsInoutData} from "../types/postType";
import {blogsRepository} from "./blogs-repository";
import {postDBType, postType} from "../db/dbType";
import {postsCollection} from "../db/dbInMongo";


export const postsRepository = {
    async getAllPosts(): Promise<postType[]> {
        const posts = await postsCollection.find().toArray()
        return this._postMapping(posts)
    },
    async findPostById(id: string): Promise<postType | null> {
        const post = await postsCollection.findOne({id: id})

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

        let {title, shortDescription, content, blogId} = newPostCreatedData

        const blog = await blogsRepository.findBlogById(blogId)

        const newPost = {
            id: String(+(new Date())),
            createdAt: new Date().toISOString(),
            title,
            shortDescription,
            content,
            blogId,
            blogName: blog!.name
        }

        const result = await postsCollection.insertOne(newPost)
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
        const result = await postsCollection.updateOne({id: postId}, {$set: updatePost})
        return result.matchedCount === 1
    },
    async deletePost(id: string): Promise<boolean> {
        const result = await postsCollection.deleteOne({id: id})

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