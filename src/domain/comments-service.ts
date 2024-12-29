import {
    CommentatorInfo,
    CommentsBDTypeClass,
    createCommentType,
    LikesInfo,
    outputCreateCommentData,
    updateCommentType, updateLikeStatusType
} from "../types/commentsType";
import {ObjectId} from "mongodb";
import {UsersRepository} from "../repositories/users-repository";
import {PostsRepository} from "../repositories/posts-repository";
import {CommentsRepository} from "../repositories/comments-repository";
import {likeStatus} from "../db/dbType";


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


export class CommentsService {


    constructor(
        protected usersRepository: UsersRepository,
        protected postsRepository: PostsRepository,
        protected commentsRepository: CommentsRepository
    ) {
    }

    async createdComment(commentData: createCommentType): Promise<Result<null | outputCreateCommentData>> {

        const post = await this.postsRepository.findPostById(commentData.postId)

        if (!post) {
            return {
                status: ResultStatus.NotFound,
                errorMessage: 'Post not found',
                data: null
            }
        }

        const user = await this.usersRepository.findUserById(commentData.userId)

        const newComment = new CommentsBDTypeClass(new ObjectId(), commentData.content,
            new Date().toISOString(), commentData.postId,
            new CommentatorInfo(commentData.userId, user!.accountData.login),
            new LikesInfo(0, 0, [])
        )


        const commentId = await this.commentsRepository.createComments(newComment)
        const createdComment = await this.commentsRepository.findCommentById(commentId.toString())
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
                    createdAt: createdComment.createdAt,
                    likesInfo: {
                        likesCount: createdComment.likesInfo.likesCount,
                        dislikesCount: createdComment.likesInfo.dislikesCount,
                        myStatus: "None"
                    }
                }
            }
        } else {
            return {
                status: ResultStatus.ServerError,
                data: null
            }
        }

    }

    async updateComment(updateData: updateCommentType): Promise<Result<boolean | null>> {

        const comment = await this.commentsRepository.findCommentById(updateData.commentId)
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
        const isUpdated = await this.commentsRepository.updateComment(updateData.commentId, updateData.content)
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
    }

    async updateLikeStatus(updateData: updateLikeStatusType): Promise<Result<boolean | null>> {

        const foundComments = await this.commentsRepository.findCommentById(updateData.commentId)
        if (!foundComments) {
            return {
                status: ResultStatus.NotFound,
                data: null
            }
        }

        let likesCount = foundComments.likesInfo.likesCount
        let dislikesCount = foundComments.likesInfo.dislikesCount

        const foundUser = await this.commentsRepository.findUserInLikeInfo(updateData.commentId, updateData.userId)
        if (!foundUser) {
            await this.commentsRepository.pushUserInLikesInfo(updateData.commentId, updateData.userId, updateData.likeStatus)

            if (updateData.likeStatus === "Like") {
                likesCount++
            }
            if (updateData.likeStatus === "Dislike") {
                dislikesCount++
            }
            await this.commentsRepository.updateLikesCount(updateData.commentId, likesCount, dislikesCount)
            return {
                status: ResultStatus.Success,
                data: null
            }

        }

        const userLikeStatus = await this.commentsRepository.findUserLikeStatus(updateData.commentId, updateData.userId)

        switch (userLikeStatus) {
            case "None":
                if (updateData.likeStatus === "Like") {
                    likesCount++
                }
                if (updateData.likeStatus === "Dislike") {
                    dislikesCount++
                }
                break
            case "Like":
                if (updateData.likeStatus === "None") {
                    likesCount--
                }
                if (updateData.likeStatus === "Dislike") {
                    likesCount--
                    dislikesCount++
                }
                break
            case "Dislike":
                if (updateData.likeStatus === "None") {
                    dislikesCount--
                }
                if (updateData.likeStatus === "Like") {
                    dislikesCount--
                    likesCount++
                }
        }

        await this.commentsRepository.updateLikesCount(updateData.commentId, likesCount, dislikesCount)
        await this.commentsRepository.updateLikesStatus(updateData.commentId, updateData.userId, updateData.likeStatus)
        return {
            status: ResultStatus.Success,
            data: null
        }

    }

    async deleteComment(id: string, userId: ObjectId): Promise<Result<boolean | null>> {


        const comment = await this.commentsRepository.findCommentById(id)
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
        const deletedComments = await this.commentsRepository.deleteComment(id)
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

