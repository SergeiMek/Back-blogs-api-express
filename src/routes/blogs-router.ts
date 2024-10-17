import {Request, Response, Router} from "express";
import {blogInputData, OutputBlogsType} from "../types/blogType";
import {blogsRepository} from "../repositories/blogs-repository";
import {HTTP_STATUSES} from "../settings";
import {authBasic} from "../midlewares/auth/auth-basic";
import {validationBlogsInput} from "../midlewares/validations/input/validation-blogs-input";


export const blogsRouter = Router({})


blogsRouter.get('/', (req: Request, res: Response<OutputBlogsType>) => {

    res.status(200).json(blogsRepository.getAllBlogs())
})

blogsRouter.get('/:id', (req: Request<{ id: string }>, res: Response<OutputBlogsType>) => {

    const blog = blogsRepository.findBlogById(req.params.id)

    if (blog) {
        res.status(HTTP_STATUSES.OK_200).json(blog)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
})

blogsRouter.post('/', authBasic,validationBlogsInput,(req: Request<{}, {}, blogInputData>, res: Response<OutputBlogsType>) => {
    const newVideoData = {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl
    }

    const createdBlog = blogsRepository.createdBlog(newVideoData)

    res.status(HTTP_STATUSES.CREATED_201).json(createdBlog)

})

blogsRouter.put('/:id', authBasic,validationBlogsInput,(req: Request<{ id: string }, {}, blogInputData>, res: Response<OutputBlogsType>) => {
    const updateBlogData = {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl
    }

    const updatedBlog = blogsRepository.updateBlog(req.params.id, updateBlogData)

    if (updatedBlog) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }

})

blogsRouter.delete('/:id', authBasic,(req: Request<{ id: string }>, res: Response<OutputBlogsType>) => {

    const isDeleted = blogsRepository.deleteBlog(req.params.id)

    if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
})



