import {findPostData, postOutputType} from "../types/postType";
import {postDBType, postType} from "../db/dbType";
import {postsMongooseModel} from "../db/mongooseSchema/mongooseSchema";


export const postsQueryRepository = {
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
            items: this._postMapping(findPosts)
        }


    },
        async findPostById(id: string): Promise<postType | null> {
            const post =  await postsMongooseModel.findOne({id: id})

            if (post) {
                return {
                    id: post.id,
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: post.blogId,
                    blogName: post.blogName,
                    createdAt: post.createdAt
                }
            } else {
                return null
            }
        },
    _postMapping(array: postDBType[]): postType[] {
        return array.map((post) => {
            return {
                id: post.id,
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt
            };
        });
    }

}