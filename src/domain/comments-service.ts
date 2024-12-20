import {
    CommentatorInfo,
    CommentsBDTypeClass,
    createCommentType,
    outputCommentType,
    updateCommentType
} from "../types/commentsType";
import {ObjectId} from "mongodb";
import {UsersRepository} from "../repositories/users-repository";
import {PostsRepository} from "../repositories/posts-repository";
import {CommentsRepository} from "../repositories/comments-repository";


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

    async createdComment(commentData: createCommentType): Promise<Result<outputCommentType | null>> {

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
            new CommentatorInfo(commentData.userId, user!.accountData.login)
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
                    createdAt: createdComment.createdAt
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

