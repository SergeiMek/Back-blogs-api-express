import {commentsCollection} from "../db/dbInMongo";
import {ObjectId} from "mongodb";
import {commentType} from "../types/commentsType";


export const commentsRepository = {

    async createComments(newCommentData: commentType): Promise<ObjectId> {
        const result = await commentsCollection.insertOne(newCommentData)
        return result.insertedId
    },
    async findCommentById(id: string) {
        if (!this._checkObjectId(id)) return false;
        return await commentsCollection.findOne({_id: new ObjectId(id)})

    },
    async updateComment(commentId: string, content: string): Promise<boolean> {

        const update = await commentsCollection.updateOne({_id: new ObjectId(commentId)}, {$set: {content}})
        return update.acknowledged
    },
    async deleteComment(commentId: string): Promise<boolean> {
        if (!this._checkObjectId(commentId)) return false;
        const deleted = await commentsCollection.deleteOne({_id: new ObjectId(commentId)})
        return deleted.acknowledged

    },
    _checkObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }
}