import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authBasic} from "../midlewares/auth/auth-basic";
import {OutputPostsType, postsInoutData} from "../types/postType";
import {validationPosts} from "../midlewares/validations/input/validation-posts-input";
import {postsService} from "../domain/posts-service";


export const postsRouter = Router({})


postsRouter.get('/', async (req: Request, res: Response<OutputPostsType>) => {

    res.status(HTTP_STATUSES.OK_200).json(await postsService.getAllPosts())
})

postsRouter.get('/:id', async (req: Request<{ id: string }>, res: Response<OutputPostsType>) => {

    const post = await postsService.findPostById(req.params.id)

    if (post) {
        res.status(HTTP_STATUSES.OK_200).json(post)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
})

postsRouter.post('/', authBasic, validationPosts, async (req: Request<{}, {}, postsInoutData>, res: Response<OutputPostsType>) => {
    /*const newPostData = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: req.body.blogId
    }*/

    const createdPost = await postsService.createdPost(req.body)

    res.status(HTTP_STATUSES.CREATED_201).json(createdPost)

})

postsRouter.put('/:id', authBasic, validationPosts ,async (req: Request<{
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



