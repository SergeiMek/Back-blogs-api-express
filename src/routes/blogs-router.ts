import {Request, Response, Router} from "express";
import {blogInputData, blogInputPostData, blogQueryBlogType, OutputBlogsType} from "../types/blogType";
import {blogsService} from "../domain/blogs-service";
import {HTTP_STATUSES} from "../settings";
import {authBasic} from "../midlewares/auth/auth-basic";
import {
    validationBlogsFindByParamId,
    validationBlogsInput
} from "../midlewares/validations/input/validation-blogs-input";
import {BlogsQueryRepository} from "../repositories/blog-query-repository";
import {paginationQueries} from "../helpers/paginations_values";
import {postsQueryRepository} from "../repositories/posts-query-repository";
import {OutputPostsType} from "../types/postType";
import {postsService} from "../domain/posts-service";
import {validationPosts} from "../midlewares/validations/input/validation-posts-input";
import {validationBlogInPost} from "../midlewares/validations/input/validationBlogCreatePost";


export const blogsRouter = Router({})


blogsRouter.get('/', async (req: Request<{}, {}, {}, blogQueryBlogType>, res: Response<OutputBlogsType>) => {

    const {searchNameTerm, sortBy, sortDirection, pageNumber, pageSize} = paginationQueries(req)


    res.status(200).json(await BlogsQueryRepository.getAllBlogs({
        searchNameTerm,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize
    }))
})

blogsRouter.get('/:blogId/posts', validationBlogsFindByParamId, async (req: Request<{
    blogId: string
}, {}, {}, blogQueryBlogType>, res: Response<OutputPostsType>) => {

    const {sortBy, sortDirection, pageNumber, pageSize} = paginationQueries(req)
    const blogId = req.params.blogId


    res.status(200).json(await postsQueryRepository.getAllPosts({sortBy, sortDirection, pageNumber, pageSize, blogId}))
})


blogsRouter.get('/:id', async (req: Request<{ id: string }>, res: Response<OutputBlogsType>) => {


    const blog = await BlogsQueryRepository.findBlogById(req.params.id)

    if (blog) {
        res.status(HTTP_STATUSES.OK_200).json(blog)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
})

blogsRouter.post('/', authBasic, validationBlogsInput, async (req: Request<{}, {}, blogInputData>, res: Response<OutputBlogsType>) => {


    const createdBlog = await blogsService.createdBlog(req.body)

    res.status(HTTP_STATUSES.CREATED_201).json(createdBlog)

})
blogsRouter.post('/:blogId/posts',authBasic, validationBlogInPost,async (req: Request<{
    blogId: string
}, {}, blogInputPostData>, res: Response<OutputPostsType>) => {

    const createdPost = await postsService.createdPost({...req.body, blogId: req.params.blogId})

    res.status(HTTP_STATUSES.CREATED_201).json(createdPost)
})


blogsRouter.put('/:id', authBasic, validationBlogsInput, async (req: Request<{
    id: string
}, {}, blogInputData>, res: Response<OutputBlogsType>) => {

    const updatedBlog = await blogsService.updateBlog(req.params.id, req.body)

    if (updatedBlog) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }

})

blogsRouter.delete('/:id', authBasic, async (req: Request<{ id: string }>, res: Response<OutputBlogsType>) => {

    const isDeleted = await blogsService.deleteBlog(req.params.id)

    if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
})



