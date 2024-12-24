import {commentsDBType} from "../db/dbType";
import {CommentsOutputType, findCommentsData, outputCreateCommentData} from "../types/commentsType";
import {ObjectId} from "mongodb";
import {commentsMongooseModel, postsMongooseModel} from "../db/mongooseSchema/mongooseSchema";
import {commentsRepository} from "../commposition-root";


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


export class CommentsQueryRepository {
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
                items:await this._commentMapping(findComment, data?.userId)
            }
        }


    }

    async getCommentById(id: string,userId?:ObjectId): Promise<outputCreateCommentData | null> {
        if (!this._checkObjectId(id)) return null;
        const comment = await commentsMongooseModel.findOne({_id: new ObjectId(id)}).lean()

        let status

        if(userId){
            status = await commentsRepository.findUserLikeStatus(id,userId)
        }


        if (comment) {
            return  {id: comment._id,
                content: comment.content,
                commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin
            },
            createdAt: comment.createdAt,
                likesInfo: {
                likesCount: comment.likesInfo.likesCount,
                    dislikesCount: comment.likesInfo.dislikesCount,
                    myStatus: "None"
            }}
        } else {
            return null
        }

    }

    async _commentMapping(array: commentsDBType[], userId?: ObjectId): Promise<outputCreateCommentData[]> {
        return Promise.all(
            array.map(async (comment) => {
                let status

                if (userId) {
                    status = await commentsRepository.findUserLikeStatus(
                        comment._id.toString(),
                        userId
                    );
                }


                return {
                    id: comment._id,
                    content: comment.content,
                    commentatorInfo: {
                        userId: comment.commentatorInfo.userId,
                        userLogin: comment.commentatorInfo.userLogin
                    },
                    createdAt: comment.createdAt,
                    likesInfo: {
                        likesCount: comment.likesInfo.likesCount,
                        dislikesCount: comment.likesInfo.dislikesCount,
                        myStatus: status || "None"

                    }
                }
            }))

    }

    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }
}

