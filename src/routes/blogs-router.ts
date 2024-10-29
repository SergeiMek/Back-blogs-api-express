import {Request, Response,Router} from "express";
import {blogInputData, OutputBlogsType} from "../types/blogType";
import {blogsService} from "../domain/blogs-service";
import {HTTP_STATUSES} from "../settings";
import {authBasic} from "../midlewares/auth/auth-basic";
import {validationBlogsInput} from "../midlewares/validations/input/validation-blogs-input";


export const blogsRouter = Router({})


blogsRouter.get('/', async (req: Request, res: Response<OutputBlogsType>) => {

    res.status(200).json(await blogsService.getAllBlogs())
})

blogsRouter.get('/:id', async (req: Request<{ id: string }>, res: Response<OutputBlogsType>) => {


    const blog = await blogsService.findBlogById(req.params.id)

    if (blog) {
        res.status(HTTP_STATUSES.OK_200).json(blog)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
    }
})

blogsRouter.post('/', authBasic, validationBlogsInput, async (req: Request<{}, {}, blogInputData>, res: Response<OutputBlogsType>) => {
    /*const newVideoData = {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl
    }*/

   // const createdBlog = await blogsService.createdBlog(newVideoData)
    const createdBlog = await blogsService.createdBlog(req.body)

    res.status(HTTP_STATUSES.CREATED_201).json(createdBlog)

})

blogsRouter.put('/:id', authBasic, validationBlogsInput, async (req: Request<{
    id: string
}, {}, blogInputData>, res: Response<OutputBlogsType>) => {
  /*  const updateBlogData = {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl
    }*/

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



