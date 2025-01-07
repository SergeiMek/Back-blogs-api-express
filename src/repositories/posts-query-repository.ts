import {findPostData, postOutputType} from "../types/postType";
import {outputPostType, postDBType, postType} from "../db/dbType";
import {postsMongooseModel} from "../db/mongooseSchema/mongooseSchema";
import {ObjectId} from "mongodb";
import {postsRepository} from "../commposition-root";


export class PostsQueryRepository {
    async getAllPosts(data: findPostData): Promise<postOutputType> {
        let filter: any = {}

        if (data.blogId) {
            filter.blogId = data.blogId
        }

        const findPosts = await postsMongooseModel.find(filter).sort({[data.sortBy]: data.sortDirection === 'asc' ? 1 : -1}).skip((data.pageNumber - 1) * data.pageSize).limit(data.pageSize).lean()
        const totalCount = await postsMongooseModel.countDocuments(filter)
        const pageCount = Math.ceil(totalCount / data.pageSize)

        return {
            pagesCount: pageCount,
            page: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: totalCount,
            items: await this.postMapping(findPosts, data.userId)
        }


    }

    async findPostById(id: string, userId?: ObjectId): Promise<outputPostType | null> {
        const post = await postsMongooseModel.findOne({id: id})
        if (!post) {
            return null
        }
        let status
        if (userId) {
            status = await postsRepository.findUserLikeStatus(id, userId)
        }
        const likesArray = post.likesInfo.users.filter((p) => p.likeStatus === "Like")
            .sort((a, b) => -a.addedAt.localeCompare(b.addedAt))
            .map((p) => {
                return {
                    addedAt: p.addedAt,
                    userId: p.userId,
                    login: p.userLogin
                }
            }).splice(0, 3)

        return {
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                likesCount: post.likesInfo.likesCount,
                dislikesCount: post.likesInfo.dislikesCount,
                myStatus: status || "None",
                newestLikes: likesArray
            }
        }
    }

    private async postMapping(array: postDBType[], userId?: ObjectId): Promise<outputPostType[]> {
        return Promise.all(
            array.map(async (p) => {
                let status

                if (userId) {
                    status = await postsRepository.findUserLikeStatus(p.id, userId)
                }
                const likesArray = p.likesInfo.users.filter((p) => p.likeStatus === "Like")
                    .sort((a, b) => -a.addedAt.localeCompare(b.addedAt))
                    .map((p) => {
                        return {
                            addedAt: p.addedAt,
                            userId: p.userId,
                            login: p.userLogin
                        }
                    }).splice(0, 3)
                return {
                    id: p.id,
                    title: p.title,
                    shortDescription: p.shortDescription,
                    content: p.content,
                    blogId: p.blogId,
                    blogName: p.blogName,
                    createdAt: p.createdAt,
                    extendedLikesInfo: {
                        likesCount: p.likesInfo.likesCount,
                        dislikesCount: p.likesInfo.dislikesCount,
                        myStatus: status || "None",
                        newestLikes: likesArray
                    }
                }
            })
        )
    }
}

