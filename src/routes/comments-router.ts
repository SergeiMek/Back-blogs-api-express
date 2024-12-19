import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {validationCommentsInputPost} from "../midlewares/validations/input/validation-comments-input";
import {authMiddleware} from "../midlewares/auth/authMiddlewareJWT";
import {commentsService} from "../domain/comments-service";
import {outputCommentType} from "../types/commentsType";
import {commentsQueryRepository} from "../repositories/comments-query-repository";


export const commentsRouter = Router({})


class CommentsController {
    async getCommentById(req: Request<{ id: string }>, res: Response<outputCommentType>) {

        const comment = await commentsQueryRepository.getCommentById(req.params.id)

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

        const isUpdatedStatus = await commentsService.updateComment(commentData)


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

        const isDeleted = await commentsService.deleteComment(req.params.commentId, req.user!._id)


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

const commentsControllerInstance = new CommentsController()




commentsRouter.get('/:id', commentsControllerInstance.getCommentById)
commentsRouter.put('/:commentId', authMiddleware, validationCommentsInputPost, commentsControllerInstance.updateComment)
commentsRouter.delete('/:commentId', authMiddleware, commentsControllerInstance.deleteComment)



