import {PostDBModel, postsInoutData, updateLikesDataType} from "../types/postType";
import {outputPostType} from "../db/dbType";
import {PostsRepository} from "../repositories/posts-repository";
import {BlogsRepository} from "../repositories/blogs-repository";
import {ObjectId} from "mongodb";
import {UsersRepository} from "../repositories/users-repository";
import {inject, injectable} from "inversify";


enum ResultStatus {
    Success = 0,
    Forbidden = 1,
    NotFound = 2,
    ServerError = 3,
    emailNotSent = 45
}

type Result<T> = {
    status: ResultStatus
    errorMessage?: string
    data: T
}

@injectable()
export class PostsService {
    constructor(
        @inject(PostsRepository)   protected postsRepository: PostsRepository,
        @inject(BlogsRepository)  protected blogsRepository: BlogsRepository,
        @inject(UsersRepository) protected usersRepository: UsersRepository
    ) {
    }

    async createdPost(newPostCreatedData: postsInoutData): Promise<outputPostType> {
        const blog = await this.blogsRepository.findBlogById(newPostCreatedData.blogId)


        const newPost = new PostDBModel(new ObjectId(),
            String(+(new Date())),
            newPostCreatedData.title,
            newPostCreatedData.shortDescription,
            newPostCreatedData.content,
            newPostCreatedData.blogId,
            blog!.name,
            new Date().toISOString(),
            {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        )

        const result = await this.postsRepository.createdPost(newPost)

        return {
            id: result.id,
            title: result.title,
            shortDescription: result.shortDescription,
            content: result.content,
            blogId: result.blogId,
            blogName: result.blogName,
            createdAt: result.createdAt,
            extendedLikesInfo: {
                likesCount: result.likesInfo.likesCount,
                dislikesCount: result.likesInfo.dislikesCount,
                myStatus: "None",
                newestLikes: []
            },
        };
    }


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
        const result = await this.postsRepository.updatePost(postId, updatePost)
        return result.matchedCount === 1
    }

    async deletePost(id: string): Promise<boolean> {
        const result = await this.postsRepository.deletePost(id)

        return result.deletedCount === 1

    }

    async updateLikesStatus(data: updateLikesDataType): Promise<Result<boolean | null>> {
        const foundPost = await this.postsRepository.findPostById(data.postId)
        if (!foundPost) {
            return {
                status: ResultStatus.NotFound,
                data: null
            }
        }

        let likesCount = foundPost.likesInfo.likesCount
        let dislikesCount = foundPost.likesInfo.dislikesCount

        const foundUser = await this.postsRepository.findUserInLikesInfo(data.postId, data.userId)

        const user = await this.usersRepository.findUserById(data.userId)
        const login = user!.accountData.login

        const pushData = {
            postId: data.postId,
            addedAt: new Date().toISOString(),
            userId: data.userId,
            userLogin: login,
            likeStatus: data.likeStatus
        }

        if (!foundUser) {
            await this.postsRepository.pushUserInLikesInfo(pushData)
            if (data.likeStatus === "Like") {
                likesCount++
            }
            if (data.likeStatus === "Dislike") {
                dislikesCount++
            }

            await this.postsRepository.updateLikesCount(data.postId, likesCount, dislikesCount)
            return {
                status: ResultStatus.Success,
                data: null
            }
        }

        const userLikeDBStatus = await this.postsRepository.findUserLikeStatus(data.postId, data.userId)

        switch (userLikeDBStatus) {
            case"None":
                if (data.likeStatus === "Like") {
                    likesCount++
                }

                if (data.likeStatus === "Dislike") {
                    dislikesCount++
                }
                break
            case "Like":
                if (data.likeStatus === "None") {
                    likesCount--
                }
                if (data.likeStatus === "Dislike") {
                    dislikesCount++
                    likesCount--
                }
                break
            case "Dislike":
                if (data.likeStatus === "None") {
                    dislikesCount--
                }
                if (data.likeStatus === "Like") {
                    dislikesCount--
                    likesCount++
                }
        }
        await this.postsRepository.updateLikesCount(data.postId, likesCount, dislikesCount)
        await this.postsRepository.updateLikesStatus(data.postId, data.userId, data.likeStatus)

        return {
            status: ResultStatus.Success,
            data: null
        }
    }
}

