import {Request, Response, Router} from "express";
import {blogInputData, OutputBlogsType} from "../types/blogType";
import {blogsRepository} from "../repositories/blogs-repository";
import {HTTP_STATUSES} from "../settings";
import {authBasic} from "../midlewares/auth/auth-basic";
import {validationBlogsInput} from "../midlewares/validations/input/validation-blogs-input";


export const blogsRouter = Router({})


blogsRouter.get('/', async (req: Request, res: Response<OutputBlogsType>) => {

    res.status(200).json(await blogsRepository.getAllBlogs())
})

blogsRouter.get('/:id', async (req: Request<{ id: string }>, res: Response<OutputBlogsType>) => {

    const blog = await blogsRepository.findBlogById(req.params.id)

    if (blog) {
        res.status(HTTP_STATUSES.OK_200).json(blog)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
})

blogsRouter.post('/', authBasic, validationBlogsInput, async (req: Request<{}, {}, blogInputData>, res: Response<OutputBlogsType>) => {
    const newVideoData = {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl
    }

    const createdBlog = await blogsRepository.createdBlog(newVideoData)

    res.status(HTTP_STATUSES.CREATED_201).json(createdBlog)

})

blogsRouter.put('/:id', authBasic, validationBlogsInput, async (req: Request<{
    id: string
}, {}, blogInputData>, res: Response<OutputBlogsType>) => {
    const updateBlogData = {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl
    }

    const updatedBlog = await blogsRepository.updateBlog(req.params.id, updateBlogData)

    if (updatedBlog) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }

})

blogsRouter.delete('/:id', authBasic, async (req: Request<{ id: string }>, res: Response<OutputBlogsType>) => {

    const isDeleted = await blogsRepository.deleteBlog(req.params.id)

    if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
})



