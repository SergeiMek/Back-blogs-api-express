import {Request, Response, Router} from "express";
import {blogInputData, blogInputPostData, blogQueryBlogType, OutputBlogsType} from "../types/blogType";
import {HTTP_STATUSES} from "../settings";
import {authBasic} from "../midlewares/auth/auth-basic";
import {validationBlogsInput} from "../midlewares/validations/input/validation-blogs-input";
import {paginationQueries} from "../helpers/paginations_values";
import {OutputPostsType} from "../types/postType";
import {validationBlogInPost} from "../midlewares/validations/input/validationBlogCreatePost";
import {PostsService} from "../domain/posts-service";
import {PostsQueryRepository} from "../repositories/posts-query-repository";
import {BlogsService} from "../domain/blogs-service";
import {BlogQueryRepository} from "../repositories/blog-query-repository";
import {
    blogsQueryRepository,
    blogsService,
    postsQueryRepository,
    postsService
} from "../commposition-root";


export const blogsRouter = Router({})


export class BlogsController {


    constructor(
       protected blogsQueryRepository: BlogQueryRepository,
       protected postsService: PostsService,
       protected postsQueryRepository: PostsQueryRepository,
       protected blogsService: BlogsService
    ) {}

    async getAllBlogs(req: Request<{}, {}, {}, blogQueryBlogType>, res: Response<OutputBlogsType>) {

        const {searchNameTerm, sortBy, sortDirection, pageNumber, pageSize} = paginationQueries(req)


        res.status(200).json(await this.blogsQueryRepository.getAllBlogs({
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

        res.status(200).json(await this.postsQueryRepository.getAllPosts({
            sortBy,
            sortDirection,
            pageNumber,
            pageSize,
            blogId
        }))
    }

    async findBlogById(req: Request<{ id: string }>, res: Response<OutputBlogsType>) {
        const blog = await this.blogsQueryRepository.findBlogById(req.params.id)
        if (blog) {
            res.status(HTTP_STATUSES.OK_200).json(blog)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
    }

    async createBlog(req: Request<{}, {}, blogInputData>, res: Response<OutputBlogsType>) {
        const createdBlog = await this.blogsService.createdBlog(req.body)
        res.status(HTTP_STATUSES.CREATED_201).json(createdBlog)
    }

    async createdPostForBlog(req: Request<{
        blogId: string
    }, {}, blogInputPostData>, res: Response<OutputPostsType>) {

        const createdPost = await this.postsService.createdPost({...req.body, blogId: req.params.blogId})

        res.status(HTTP_STATUSES.CREATED_201).json(createdPost)
    }

    async updateBlog(req: Request<{
        id: string
    }, {}, blogInputData>, res: Response<OutputBlogsType>) {

        const updatedBlog = await this.blogsService.updateBlog(req.params.id, req.body)

        if (updatedBlog) {
            res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
    }

    async deleteBlog(req: Request<{ id: string }>, res: Response<OutputBlogsType>) {

        const isDeleted = await this.blogsService.deleteBlog(req.params.id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
    }
}



const blogsControllerInstance = new BlogsController(blogsQueryRepository, postsService, postsQueryRepository, blogsService)


blogsRouter.get('/', blogsControllerInstance.getAllBlogs.bind(blogsControllerInstance))
blogsRouter.get('/:blogId/posts', blogsControllerInstance.getPostsToTheBlog.bind(blogsControllerInstance))
blogsRouter.get('/:id', blogsControllerInstance.findBlogById.bind(blogsControllerInstance))
blogsRouter.post('/', authBasic, validationBlogsInput, blogsControllerInstance.createBlog.bind(blogsControllerInstance))
blogsRouter.post('/:blogId/posts', authBasic, validationBlogInPost, blogsControllerInstance.createdPostForBlog.bind(blogsControllerInstance))
blogsRouter.put('/:id', authBasic, validationBlogsInput, blogsControllerInstance.updateBlog.bind(blogsControllerInstance))
blogsRouter.delete('/:id', authBasic, blogsControllerInstance.deleteBlog.bind(blogsControllerInstance))



