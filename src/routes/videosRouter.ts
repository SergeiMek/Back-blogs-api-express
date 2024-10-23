import {Request, Response, Router} from "express";
import {availableResolutions} from "../db/db";
import {OutputErrorsType, OutputType, videosInputType} from "../types/videosType";
import {videoRepository} from "../repositories/video-repository";


export const videosRouter = Router({})

videosRouter.get('/', async (req: Request, res: Response<OutputType>) => {
    res.status(200).json(await videoRepository.getAllVideo())
})

videosRouter.get('/:id', async (req: Request, res: Response<OutputType>) => {
    let product = await videoRepository.findVideoById(+req.params.id)
    if (product) {
        res.status(200).json(product)
    } else {
        res.sendStatus(404)
    }

})

videosRouter.post('/', async (req: Request<{}, {}, videosInputType>, res: Response<OutputType>) => {
    const errors: OutputErrorsType = {
        errorsMessages: []
    }
    if (!req.body.title || !req.body.title.trim().length || req.body.title.trim().length > 40) {
        errors.errorsMessages.push({
            message: 'incorrect title value', field: 'title'
        })
    }
    if (!req.body.author || !req.body.author.trim().length || req.body.author.trim().length > 20) {
        errors.errorsMessages.push({
            message: 'incorrect author value', field: 'author'
        })
    }

    if (Array.isArray(req.body.availableResolutions)) {
        req.body.availableResolutions.forEach((el: any) => {
            if (availableResolutions.includes(el)) {

            } else {
                errors.errorsMessages.push({
                    message: 'incorrect availableResolutions value', field: 'availableResolutions'
                })
            }
        })
    }

    if (req.body.availableResolutions.length === 0) {
        errors.errorsMessages.push({
            message: 'incorrect availableResolutions value', field: 'availableResolutions'
        })
    }

    if (errors.errorsMessages.length) {
        res.status(400).json(errors)
        return
    }

    let newVideoData = {
        title: req.body.title,
        author: req.body.author,
        availableResolutions: req.body.availableResolutions
    }
    const createdVideo = await videoRepository.createdVideo(newVideoData)
    res.status(201).json(createdVideo)
})

videosRouter.put('/:id', async (req: Request<{ id: string }, {}, videosInputType>, res: Response<OutputType>) => {

    const errors: OutputErrorsType = {
        errorsMessages: []
    }
    if (!req.body.title || !req.body.title.trim().length || req.body.title.trim().length > 40) {
        errors.errorsMessages.push({
            message: 'incorrect title value', field: 'title'
        })
    }
    if (!req.body.author || !req.body.author.trim().length || req.body.author.trim().length > 20) {
        errors.errorsMessages.push({
            message: 'incorrect author value', field: 'author'
        })
    }
    if (!req.body.canBeDownloaded || typeof req.body.canBeDownloaded !== "boolean") {
        errors.errorsMessages.push({
            message: 'incorrect author canBeDownloaded', field: 'canBeDownloaded'
        })
    }

    if (!req.body.minAgeRestriction || req.body.minAgeRestriction > 18 || typeof req.body.minAgeRestriction !== "number") {
        errors.errorsMessages.push({
            message: 'incorrect minAgeRestriction value', field: 'minAgeRestriction'
        })
    }

    if (Array.isArray(req.body.availableResolutions)) {
        req.body.availableResolutions.forEach((el: any) => {
            if (!availableResolutions.includes(el)) {
                errors.errorsMessages.push({
                    message: 'incorrect availableResolutions value', field: 'availableResolutions'
                })
            }
        })
    }

    if (req.body.availableResolutions.length === 0) {
        errors.errorsMessages.push({
            message: 'incorrect availableResolutions value', field: 'availableResolutions'
        })
    }

    if (errors.errorsMessages.length) {
        res.status(400).json(errors)
        return
    }

    let {title, author, canBeDownloaded, minAgeRestriction} = req.body

    const updateDataVideo = {
        title,
        author,
        canBeDownloaded,
        minAgeRestriction,
        availableResolutions: req.body.availableResolutions // !!!
    }
    const isUpdated = await videoRepository.updateVideo(+req.params.id, updateDataVideo)

    if (isUpdated) {

        res.sendStatus(204)

    } else {
        res.sendStatus(404)

    }
})

videosRouter.delete('/:id', async (req: Request, res: Response<OutputType>) => {

    const isDeleted = await videoRepository.deleteVideo(+req.params.id)

    if (isDeleted) {
        res.sendStatus(204)
    } else {
        res.sendStatus(404)
    }

})

