import {postsInoutData} from "../types/postType";
import {postDBType, postType} from "../db/dbType";
import {postsRepository} from "../repositories/posts-repository";
import {blogsRepository} from "../repositories/blogs-repository";
import {BlogsQueryRepository} from "../repositories/blog-query-repository";
import {createCommentType, outputCommentType, updateCommentType} from "../types/commentsType";
import {commentsRepository} from "../repositories/comments-repository";
import {ObjectId} from "mongodb";
import {usersRepository} from "../repositories/users-repository";
import any = jasmine.any;


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

export const commentsService = {

    async createdComment(commentData: createCommentType): Promise<Result<outputCommentType | null>> {

        const post = await postsRepository.findPostById(commentData.postId)

        if (!post) {
            return {
                status: ResultStatus.NotFound,
                errorMessage: 'Post not found',
                data: null
            }
        }

        const user = await usersRepository.findUserById(commentData.userId)


        const newComment = {
            _id: new ObjectId(),
            content: commentData.content,
            commentatorInfo: {
                userId: commentData.userId,
                userLogin: user!.accountData.login
            },
            createdAt: new Date().toISOString(),
            postId: commentData.postId
        }


        const commentId = await commentsRepository.createComments(newComment)
        const createdComment = await commentsRepository.findCommentById(commentId.toString())
        if (createdComment) {
            return {
                status: ResultStatus.Success,
                data: {
                    id: createdComment._id,
                    content: createdComment.content,
                    commentatorInfo: {
                        userId: createdComment.commentatorInfo.userId,
                        userLogin: createdComment.commentatorInfo.userLogin
                    },
                    createdAt: createdComment.createdAt
                }
            }
        } else {
            return {
                status: ResultStatus.ServerError,
                data: null
            }
        }

    },
    async updateComment(updateData: updateCommentType): Promise<Result<boolean | null>> {

        const comment = await commentsRepository.findCommentById(updateData.commentId)
        if (!comment) {
            return {
                status: ResultStatus.NotFound,
                data: null
            }
        }
        ///comment.commentatorInfo.userId !== updateData.userId
        if (!comment.commentatorInfo.userId.equals(updateData.userId)) {
            return {
                status: ResultStatus.Forbidden,
                data: null
            }
        }
        const isUpdated = await commentsRepository.updateComment(updateData.commentId, updateData.content)
        if (isUpdated) {
            return {
                status: ResultStatus.Success,
                data: isUpdated
            }
        }
        return {
            status: ResultStatus.ServerError,
            data: null
        }
    },
    async deleteComment(id: string, userId: ObjectId): Promise<Result<boolean | null>> {


        const comment = await commentsRepository.findCommentById(id)
        if (!comment) {
            return {
                status: ResultStatus.NotFound,
                data: null
            }
        }
        if (!comment.commentatorInfo.userId.equals(userId)) {
            return {
                status: ResultStatus.Forbidden,
                data: null
            }
        }
        const deletedComments = await commentsRepository.deleteComment(id)
        if (deletedComments) {
            return {
                status: ResultStatus.Success,
                data: null
            }
        }
        return {
            status: ResultStatus.ServerError,
            data: null
        }
    }
}