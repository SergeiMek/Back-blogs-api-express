import {ObjectId} from "mongodb";
import {commentType} from "../types/commentsType";
import {commentsMongooseModel} from "../db/mongooseSchema/mongooseSchema";


export class CommentsRepository {
    async createComments(newCommentData: commentType): Promise<ObjectId> {
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

    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }
}

