import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authBasic} from "../midlewares/auth/auth-basic";
import {OutputPostsType, postsInoutData} from "../types/postType";
import {postsRepository} from "../repositories/posts-repository";
import {validationPosts} from "../midlewares/validations/input/validation-posts-input";


export const postsRouter = Router({})


postsRouter.get('/', async (req: Request, res: Response<OutputPostsType>) => {

    res.status(HTTP_STATUSES.OK_200).json(await postsRepository.getAllPosts())
})

postsRouter.get('/:id', async (req: Request<{ id: string }>, res: Response<OutputPostsType>) => {

    const post = await postsRepository.findPostById(req.params.id)

    if (post) {
        res.status(HTTP_STATUSES.OK_200).json(post)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
})

postsRouter.post('/', authBasic, validationPosts, async (req: Request<{}, {}, postsInoutData>, res: Response<OutputPostsType>) => {
    const newPostData = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: req.body.blogId
    }

    const createdPost = await postsRepository.createdPost(newPostData)

    res.status(HTTP_STATUSES.CREATED_201).json(createdPost)

})

postsRouter.put('/:id', authBasic, validationPosts ,async (req: Request<{
    id: string
}, {}, postsInoutData>, res: Response<OutputPostsType>) => {
    debugger
    const updatePostData = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: req.body.blogId
    }
    debugger
    const updatedPost = await postsRepository.updatePost(req.params.id, updatePostData)

    if (updatedPost) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }

})

postsRouter.delete('/:id', authBasic, async (req: Request<{ id: string }>, res: Response<OutputPostsType>) => {

    const isDeleted = await postsRepository.deletePost(req.params.id)

    if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
})



