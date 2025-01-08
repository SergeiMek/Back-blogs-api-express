import {postsInoutData, pushUserInLikeType} from "../types/postType";
import {postDBType, postType} from "../db/dbType";
import {DeleteResult, ObjectId, UpdateResult} from "mongodb";
import {postsMongooseModel} from "../db/mongooseSchema/mongooseSchema";
import { injectable } from "inversify";

@injectable()
export class PostsRepository {
    async createdPost(newPostCreatedData: postType): Promise<postType> {
        const smartUserModel = new postsMongooseModel(newPostCreatedData);
        await smartUserModel.save();
        return newPostCreatedData
    }

    async findPostById(id: string): Promise<postDBType | null> {
        //return await postsCollection.findOne({id: id})
        return postsMongooseModel.findOne({id: id})

    }

    async updatePost(postId: string, updatePostData: postsInoutData): Promise<UpdateResult> {
        return postsMongooseModel.updateOne({id: postId}, {$set: updatePostData})
    }

    async deletePost(id: string): Promise<DeleteResult> {
        return postsMongooseModel.deleteOne({id: id})

    }

    async findUserLikeStatus(postId: string, userId: ObjectId) {
        const foundUser = await postsMongooseModel.findOne(
            { id: postId },
            {
                "likesInfo.users": {
                    $filter: {
                        input: "$likesInfo.users",
                        cond: { $eq: ["$$this.userId", userId.toString()] },
                    },
                },
            }
        );
        if (!foundUser || foundUser.likesInfo.users.length === 0) {
            return null
        }
        return foundUser.likesInfo.users[0].likeStatus
    }

    async findUserInLikesInfo(postId: string, userId: ObjectId) {
        const foundUser = await postsMongooseModel.findOne({
            id: postId,
            "likesInfo.users.userId": userId
        })
        if (!foundUser) {
            return null
        }
        return foundUser
    }

    async pushUserInLikesInfo(data: pushUserInLikeType): Promise<boolean> {
        const result = await postsMongooseModel.updateOne({id: data.postId},
            {
                $push: {
                    "likesInfo.users": {
                        addedAt: data.addedAt,
                        userId: data.userId,
                        userLogin: data.userLogin,
                        likeStatus: data.likeStatus
                    }
                }
            }
        )
        return result.matchedCount === 1
    }

    async updateLikesCount(postId: string, likesCount: number, dislikesCount: number): Promise<boolean> {
        const result = await postsMongooseModel.updateOne({id: postId},
            {
                $set: {
                    "likesInfo.likesCount": likesCount,
                    "likesInfo.dislikesCount": dislikesCount
                }
            })
        return result.matchedCount === 1
    }

    async updateLikesStatus(postId: string, userId: ObjectId, likeStatus: string): Promise<boolean> {

        const result = await postsMongooseModel.updateOne(
            {id: postId, "likesInfo.users.userId": userId},
            {
                $set: {
                    "likesInfo.users.$.likeStatus": likeStatus
                }
            })

        return result.matchedCount === 1
    }
}

