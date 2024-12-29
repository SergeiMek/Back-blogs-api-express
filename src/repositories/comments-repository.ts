import {ObjectId} from "mongodb";

import {commentsMongooseModel} from "../db/mongooseSchema/mongooseSchema";
import {commentsDBType} from "../db/dbType";


export class CommentsRepository {
    async createComments(newCommentData: commentsDBType): Promise<ObjectId> {
        const result = await commentsMongooseModel.create(newCommentData)
        return result._id
    }

    async findCommentById(id: string) {
        if (!this._checkObjectId(id)) return false;
        return commentsMongooseModel.findOne({_id: new ObjectId(id)})

    }

    async updateComment(commentId: string, content: string): Promise<boolean> {

        const update = await commentsMongooseModel.updateOne({_id: new ObjectId(commentId)}, {$set: {content}})
        return update.acknowledged
    }

    async deleteComment(commentId: string): Promise<boolean> {
        if (!this._checkObjectId(commentId)) return false;
        const deleted = await commentsMongooseModel.deleteOne({_id: new ObjectId(commentId)})
        return deleted.acknowledged

    }

    async findUserLikeStatus(commentId: string, userId: ObjectId): Promise<string | null> {
        const foundUser = await commentsMongooseModel.findOne(
            {_id: commentId},
            {
                "likesInfo.users": {
                    $filter: {
                        input: "$likesInfo.users",
                        cond: {$eq: ["$$this.userId", userId.toString()]},
                    },
                },
            }
        ).lean();
        if (!foundUser || foundUser.likesInfo.users.length === 0) {
            return null;
        }

        return foundUser.likesInfo.users[0].likeStatus;
    }

    async findUserInLikeInfo(commentId: string, userId: ObjectId): Promise<commentsDBType | null> {
        const foundUser = await commentsMongooseModel.findOne({
            _id: commentId,
            "likesInfo.users.userId": userId
        })
        if (!foundUser) {
            return null
        }
        return foundUser
    }

    async updateLikesCount(commentId: string, likesCount: number, dislikeCount: number): Promise<boolean> {
        const result = await commentsMongooseModel.updateOne(
            {_id: commentId},
            {
                $set: {
                    "likesInfo.likesCount": likesCount,
                    "likesInfo.dislikesCount": dislikeCount
                }
            }
        )
        return result.matchedCount === 1
    }

    async updateLikesStatus(commentId: string, userId: ObjectId, likeStatus: string): Promise<boolean> {
        const result = await commentsMongooseModel.updateOne(
            {_id: commentId, "likesInfo.users.userId": userId},
            {
                $set: {
                    "likesInfo.users.$.likeStatus": likeStatus,
                }
            }
        )
        return result.matchedCount === 1
    }

    async pushUserInLikesInfo(commentId: string, userId: ObjectId, likeStatus: string): Promise<boolean> {
        const result = await commentsMongooseModel.updateOne({_id: commentId},
            {
                $push: {
                    "likesInfo.users": {
                        userId,
                        likeStatus
                    }
                }
            })
        return result.matchedCount === 1
    }

    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }
}

