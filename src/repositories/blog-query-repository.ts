import {blogsDBType, blogsType} from "../db/dbType";
import {blogDataFindType, blogQueryOutputType} from "../types/blogType";
import {blogsCollection} from "../db/dbInMongo";

export const BlogsQueryRepository = {
    async getAllBlogs(queryData: blogDataFindType): Promise<blogQueryOutputType> {

        const filter: any = {}

        if (queryData.searchNameTerm) {
            filter.name = {$regex: queryData.searchNameTerm, $options: 'i'}
        }

        const blogs = await blogsCollection.find(filter).skip((queryData.pageNumber - 1) * queryData.pageSize).limit(queryData.pageSize).sort({[queryData.sortBy]: queryData.sortDirection === 'asc' ? 1 : -1}).toArray()
        const blogCount = await blogsCollection.countDocuments(filter)

        return {
            pagesCount: Math.ceil(blogCount / queryData.pageSize),
            page: queryData.pageNumber,
            pageSize: queryData.pageSize,
            totalCount: blogCount,
            items: this._blogMapping(blogs)
        }


    },
    async findBlogById(id: string): Promise<blogsType | null> {
        const blog = await blogsCollection.findOne({id: id})
        if (blog) {
            return {
                id: blog.id,
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership
            }
        } else {
            return null
        }
    },
    _blogMapping(array: blogsDBType[]): blogsType[] {
        return array.map((blog) => {
            return {
                id: blog.id,
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership
            };
        });
    }

}