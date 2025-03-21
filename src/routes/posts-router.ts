import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authBasic} from "../midlewares/auth/auth-basic";
import {OutputPostsType, postsInoutData} from "../types/postType";
import {validationPosts} from "../midlewares/validations/input/validation-posts-input";
import {paginationQueries} from "../helpers/paginations_values";
import {blogQueryBlogType} from "../types/blogType";
import {
    validationCommentsInputPost,
    validationUpdateLikeStatus
} from "../midlewares/validations/input/validation-comments-input";
import {authMiddleware} from "../midlewares/auth/authMiddlewareJWT";
import {CommentsOutputType, commentsQueryType} from "../types/commentsType";
import {PostsService} from "../domain/posts-service";
import {PostsQueryRepository} from "../repositories/posts-query-repository";
import {CommentsQueryRepository} from "../repositories/comments-query-repository";
import {CommentsService} from "../domain/comments-service";
import {container} from "../commposition-root";
import {tokenParser} from "../midlewares/auth/tokenParser";
import {outputPostType} from "../db/dbType";
import {inject, injectable} from "inversify";


export const postsRouter = Router({})

@injectable()
export class PostsController {


    constructor(
        @inject(PostsService) protected postsService: PostsService,
        @inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository,
        @inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository,
        @inject(CommentsService) protected commentsService: CommentsService
    ) {
    }

    async getAllPosts(req: Request<{}, {}, {}, blogQueryBlogType>, res: Response<OutputPostsType>) {
        const {sortBy, sortDirection, pageNumber, pageSize} = paginationQueries(req)

        const userId = req.user?._id

        res.status(HTTP_STATUSES.OK_200).json(await this.postsQueryRepository.getAllPosts({
            sortBy,
            sortDirection,
            pageNumber,
            pageSize,
            userId
        }))
    }

    async findPostById(req: Request<{ id: string }>, res: Response<outputPostType | null>) {

        const userId = req.user?._id
        const post = await this.postsQueryRepository.findPostById(req.params.id, userId)

        if (post) {
            res.status(HTTP_STATUSES.OK_200).json(post)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
    }

    async createdPost(req: Request<{}, {}, postsInoutData>, res: Response<outputPostType>) {


        const createdPost = await this.postsService.createdPost(req.body)

        res.status(HTTP_STATUSES.CREATED_201).json(createdPost)
    }

    async getCommentsForPost(req: Request<{
        postId: string
    }, {}, {}, commentsQueryType>, res: Response<CommentsOutputType | null>) {
        const postId = req.params.postId
        const {pageNumber, pageSize, sortBy, sortDirection} = paginationQueries(req)
        const findComments = await this.commentsQueryRepository.getAllComments({
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            postId,
            userId: req.user?._id
        })
        if (findComments.status === 1) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
        if (findComments.status === 0) {
            res.status(HTTP_STATUSES.OK_200).send(findComments.data)
        }
    }

    async updateLikeStatus(req: Request<{
        postId: string
    }, {}, { likeStatus: string }>, res: Response<CommentsOutputType | null>) {

        const likeStatusData = {
            postId: req.params.postId,
            userId: req.user!._id,
            likeStatus: req.body.likeStatus
        }

        const isUpdatedStatus = await this.postsService.updateLikesStatus(likeStatusData)

        if (isUpdatedStatus.status === 2) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
        if (isUpdatedStatus.status === 0) {
            res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
        }


    }

    async createCommentForPost(req: Request<{
        postId: string
    }, {}, { content: string }>, res: Response) {
        const commentData = {
            userId: req.user!._id,
            content: req.body.content,
            postId: req.params.postId
        }
        const createdComment = await this.commentsService.createdComment(commentData)

        if (createdComment.status === 2) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
        if (createdComment.status === 0) {
            res.status(HTTP_STATUSES.CREATED_201).send(createdComment.data)
        }
    }

    async updatePost(req: Request<{
        id: string
    }, {}, postsInoutData>, res: Response<OutputPostsType>) {
        const updatedPost = await this.postsService.updatePost(req.params.id, req.body)

        if (updatedPost) {
            res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
    }

    async deletePost(req: Request<{ id: string }>, res: Response<OutputPostsType>) {

        const isDeleted = await this.postsService.deletePost(req.params.id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
    }
}


//const postsControllerInstance = new PostsController(postsService, postsQueryRepository, commentsQueryRepository, commentsService)
const postsControllerInstance = container.resolve(PostsController)


// @ts-ignore
postsRouter.get('/', tokenParser, postsControllerInstance.getAllPosts.bind(postsControllerInstance))
postsRouter.get('/:id', tokenParser, postsControllerInstance.findPostById.bind(postsControllerInstance))
postsRouter.post('/', authBasic, validationPosts, postsControllerInstance.createdPost.bind(postsControllerInstance))
// @ts-ignore
postsRouter.get('/:postId/comments', tokenParser, postsControllerInstance.getCommentsForPost.bind(postsControllerInstance))
postsRouter.post('/:postId/comments', authMiddleware, validationCommentsInputPost, postsControllerInstance.createCommentForPost.bind(postsControllerInstance))
postsRouter.put('/:id', authBasic, validationPosts, postsControllerInstance.updatePost.bind(postsControllerInstance))
postsRouter.put('/:postId/like-status', authMiddleware, validationUpdateLikeStatus, postsControllerInstance.updateLikeStatus.bind(postsControllerInstance))
postsRouter.delete('/:id', authBasic, postsControllerInstance.deletePost.bind(postsControllerInstance))



