import {Request, Response, Router} from "express";
import {blogInputData, blogInputPostData, blogQueryBlogType, OutputBlogsType} from "../types/blogType";
import {blogsService} from "../domain/blogs-service";
import {HTTP_STATUSES} from "../settings";
import {authBasic} from "../midlewares/auth/auth-basic";
import {validationBlogsInput} from "../midlewares/validations/input/validation-blogs-input";
import {blogsQueryRepository} from "../repositories/blog-query-repository";
import {paginationQueries} from "../helpers/paginations_values";
import {postsQueryRepository} from "../repositories/posts-query-repository";
import {OutputPostsType} from "../types/postType";
import {postsService} from "../domain/posts-service";
import {validationBlogInPost} from "../midlewares/validations/input/validationBlogCreatePost";


export const blogsRouter = Router({})


class BlogsController {
    async getAllBlogs(req: Request<{}, {}, {}, blogQueryBlogType>, res: Response<OutputBlogsType>) {

        const {searchNameTerm, sortBy, sortDirection, pageNumber, pageSize} = paginationQueries(req)


        res.status(200).json(await blogsQueryRepository.getAllBlogs({
            searchNameTerm,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        }))
    }

    async getPostsToTheBlog(req: Request<{
        blogId: string
    }, {}, {}, blogQueryBlogType>, res: Response<OutputPostsType>) {

        const {sortBy, sortDirection, pageNumber, pageSize} = paginationQueries(req)
        const blogId = req.params.blogId

        res.status(200).json(await postsQueryRepository.getAllPosts({
            sortBy,
            sortDirection,
            pageNumber,
            pageSize,
            blogId
        }))
    }

    async findBlogById(req: Request<{ id: string }>, res: Response<OutputBlogsType>) {
        const blog = await blogsQueryRepository.findBlogById(req.params.id)
        if (blog) {
            res.status(HTTP_STATUSES.OK_200).json(blog)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
    }

    async createBlog(req: Request<{}, {}, blogInputData>, res: Response<OutputBlogsType>) {
        const createdBlog = await blogsService.createdBlog(req.body)
        res.status(HTTP_STATUSES.CREATED_201).json(createdBlog)
    }

    async createdPostForBlog(req: Request<{
        blogId: string
    }, {}, blogInputPostData>, res: Response<OutputPostsType>) {

        const createdPost = await postsService.createdPost({...req.body, blogId: req.params.blogId})

        res.status(HTTP_STATUSES.CREATED_201).json(createdPost)
    }

    async updateBlog(req: Request<{
        id: string
    }, {}, blogInputData>, res: Response<OutputBlogsType>) {

        const updatedBlog = await blogsService.updateBlog(req.params.id, req.body)

        if (updatedBlog) {
            res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
    }
    async deleteBlog(req: Request<{ id: string }>, res: Response<OutputBlogsType>) {

    const isDeleted = await blogsService.deleteBlog(req.params.id)

    if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    } else {
    res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)}}
}


const blogsControllerInstance = new BlogsController()



blogsRouter.get('/', blogsControllerInstance.getAllBlogs)
blogsRouter.get('/:blogId/posts',blogsControllerInstance.getPostsToTheBlog)
blogsRouter.get('/:id',blogsControllerInstance.findBlogById)
blogsRouter.post('/', authBasic, validationBlogsInput,blogsControllerInstance.createBlog)
blogsRouter.post('/:blogId/posts', authBasic, validationBlogInPost, blogsControllerInstance.createdPostForBlog)
blogsRouter.put('/:id', authBasic, validationBlogsInput,blogsControllerInstance.updateBlog)
blogsRouter.delete('/:id', authBasic,blogsControllerInstance.deleteBlog)



