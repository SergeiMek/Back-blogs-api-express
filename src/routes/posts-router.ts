import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authBasic} from "../midlewares/auth/auth-basic";
import {OutputPostsType, postsInoutData} from "../types/postType";
import {validationPosts} from "../midlewares/validations/input/validation-posts-input";
import {postsService} from "../domain/posts-service";
import {postsQueryRepository} from "../repositories/posts-query-repository";
import {paginationQueries} from "../helpers/paginations_values";
import {blogQueryBlogType} from "../types/blogType";
import {validationCommentsInputPost} from "../midlewares/validations/input/validation-comments-input";
import {authMiddleware} from "../midlewares/auth/authMiddlewareJWT";
import {commentsService} from "../domain/comments-service";
import {CommentsOutputType, commentsQueryType} from "../types/commentsType";
import {commentsQueryRepository} from "../repositories/comments-query-repository";


export const postsRouter = Router({})


postsRouter.get('/', async (req: Request<{}, {}, {}, blogQueryBlogType>, res: Response<OutputPostsType>) => {
    const {sortBy, sortDirection, pageNumber, pageSize} = paginationQueries(req)


    res.status(HTTP_STATUSES.OK_200).json(await postsQueryRepository.getAllPosts({
        sortBy,
        sortDirection,
        pageNumber,
        pageSize
    }))
})

postsRouter.get('/:id', async (req: Request<{ id: string }>, res: Response<OutputPostsType>) => {

    const post = await postsQueryRepository.findPostById(req.params.id)

    if (post) {
        res.status(HTTP_STATUSES.OK_200).json(post)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
})

postsRouter.post('/', authBasic, validationPosts, async (req: Request<{}, {}, postsInoutData>, res: Response<OutputPostsType>) => {


    const createdPost = await postsService.createdPost(req.body)

    res.status(HTTP_STATUSES.CREATED_201).json(createdPost)

})

postsRouter.get('/:postId/comments', async (req: Request<{
    postId: string
}, {}, {}, commentsQueryType>, res: Response<CommentsOutputType | null>) => {
    const postId = req.params.postId
    const {pageNumber, pageSize, sortBy, sortDirection} = paginationQueries(req)
    //res.status(HTTP_STATUSES.CREATED_201).json(createdComment)
    const findComments = await commentsQueryRepository.getAllComments({
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        postId
    })
    if (findComments.status === 1) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
    if (findComments.status === 0) {
        res.status(HTTP_STATUSES.OK_200).send(findComments.data)
    }
})

postsRouter.post('/:postId/comments', authMiddleware, validationCommentsInputPost, async (req: Request<{
    postId: string
}, {}, { content: string }>, res: Response) => {
    const commentData = {
        userId: req.user!._id,
        content: req.body.content,
        postId: req.params.postId
    }
    const createdComment = await commentsService.createdComment(commentData)

    if (createdComment.status === 2) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
    if (createdComment.status === 0) {
        res.status(HTTP_STATUSES.CREATED_201).send(createdComment.data)
    }

})

postsRouter.put('/:id', authBasic, validationPosts, async (req: Request<{
    id: string
}, {}, postsInoutData>, res: Response<OutputPostsType>) => {
    /*const updatePostData = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: req.body.blogId
    }*/
    const updatedPost = await postsService.updatePost(req.params.id, req.body)

    if (updatedPost) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }

})

postsRouter.delete('/:id', authBasic, async (req: Request<{ id: string }>, res: Response<OutputPostsType>) => {

    const isDeleted = await postsService.deletePost(req.params.id)

    if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
})



