import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../settings";
import {authBasic} from "../midlewares/auth/auth-basic";
import {OutputPostsType, postsInoutData} from "../types/postType";
import {validationPosts} from "../midlewares/validations/input/validation-posts-input";
import {postsService} from "../domain/posts-service";
import {postsQueryRepository} from "../repositories/posts-query-repository";
import {blogQueryBlogType} from "../types/blogType";
import {paginationQueries} from "../helpers/paginations_values";


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



