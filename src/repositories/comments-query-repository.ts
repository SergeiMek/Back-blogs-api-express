import {commentsDBType} from "../db/dbType";
import {CommentsOutputType, findCommentsData, outputCommentType} from "../types/commentsType";
import {ObjectId} from "mongodb";
import {commentsMongooseModel, postsMongooseModel} from "../db/mongooseSchema/mongooseSchema";

enum ResultStatus {
    Success = 0,
    NotFound = 1,
    ServerError = 2
}

type Result<T> = {
    status: ResultStatus
    errorMessage?: string
    data: T
}


export const commentsQueryRepository = {
    async getAllComments(data: findCommentsData): Promise<Result<CommentsOutputType | null>> {

        const post = await postsMongooseModel.findOne({id: data.postId})
        if (!post) {
            return {
                status: ResultStatus.NotFound,
                data: null
            }
        }

        let filter: any = {}

        if (data.postId) {
            filter.postId = data.postId
        }

        const findComment = await commentsMongooseModel.find(filter).sort({[data.sortBy]: data.sortDirection === 'asc' ? 1 : -1}).skip((data.pageNumber - 1) * data.pageSize).limit(data.pageSize).lean()
        const totalCount = await postsMongooseModel.countDocuments(filter)
        const pageCount = Math.ceil(totalCount / data.pageSize)


        return {
            status: ResultStatus.Success,
            data: {
                pagesCount: pageCount,
                page: data.pageNumber,
                pageSize: data.pageSize,
                totalCount: totalCount,
                items: this._commentMapping(findComment)
            }
        }


    },
    async getCommentById(id: string): Promise<outputCommentType | null> {
        if (!this._checkObjectId(id)) return null;
        const comment = await commentsMongooseModel.findOne({_id: new ObjectId(id)}).lean()
        if (comment) {
            return {
                id: comment._id,
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin
                },
                createdAt: comment.createdAt
            }
        } else {
            return null
        }

    },
    _commentMapping(array: commentsDBType[]): outputCommentType[] {
        return array.map((comment) => {
            return {
                id: comment._id,
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin
                },
                createdAt: comment.createdAt
            };
        });
    },
    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }

}