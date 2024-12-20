import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {validationCommentsInputPost} from "../midlewares/validations/input/validation-comments-input";
import {authMiddleware} from "../midlewares/auth/authMiddlewareJWT";
import {outputCommentType} from "../types/commentsType";
import {CommentsQueryRepository} from "../repositories/comments-query-repository";
import {CommentsService} from "../domain/comments-service";
import { commentsQueryRepository, commentsService} from "../commposition-root";


export const commentsRouter = Router({})


export class CommentsController {


    constructor(
        protected commentsQueryRepository: CommentsQueryRepository,
        protected commentsService: CommentsService
    ) {
    }


    async getCommentById(req: Request<{ id: string }>, res: Response<outputCommentType>) {

        const comment = await this.commentsQueryRepository.getCommentById(req.params.id)

        if (comment) {
            res.status(HTTP_STATUSES.OK_200).json(comment)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
    }

    async updateComment(req: Request<{
        commentId: string
    }, {}, { content: string }>, res: Response) {

        const commentData = {
            commentId: req.params.commentId,
            userId: req.user!._id,
            content: req.body.content
        }

        const isUpdatedStatus = await this.commentsService.updateComment(commentData)


        if (isUpdatedStatus.status === 2) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
        if (isUpdatedStatus.status === 1) {
            res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
        }
        if (isUpdatedStatus.status === 0) {
            res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
        }
    }

    async deleteComment(req: Request<{ commentId: string }>, res: Response) {

        const isDeleted = await this.commentsService.deleteComment(req.params.commentId, req.user!._id)


        if (isDeleted.status === 2) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }

        if (isDeleted.status === 1) {
            res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
        }
        if (isDeleted.status === 0) {
            res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
        }
        if (isDeleted.status === 3) {
            res.sendStatus(500)
        }
    }
}

const commentsControllerInstance = new CommentsController(commentsQueryRepository, commentsService)


commentsRouter.get('/:id', commentsControllerInstance.getCommentById.bind(commentsControllerInstance))
commentsRouter.put('/:commentId', authMiddleware, validationCommentsInputPost, commentsControllerInstance.updateComment.bind(commentsControllerInstance))
commentsRouter.delete('/:commentId', authMiddleware, commentsControllerInstance.deleteComment.bind(commentsControllerInstance))



