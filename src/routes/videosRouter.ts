import {Request, Response, Router} from "express";
import {availableResolutions, db} from "../db/db";
import {OutputErrorsType, OutputType, videosInputType} from "../videos/videosType";


export const videosRouter = Router({})

videosRouter.get('/', (req: Request, res: Response<OutputType>) => {

    res.status(200).json(db.videos)
})

videosRouter.get('/:id', (req: Request, res: Response<OutputType>) => {
    let id = +req.params.id
    let product = db.videos.find(p => p.id === id)
    if (product) {
        res.status(200).json(product)
    } else {
        res.sendStatus(404)
    }

})

videosRouter.post('/', (req: Request<{}, {}, videosInputType>, res: Response<OutputType>) => {
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

    if(req.body.availableResolutions.length ===0){
        errors.errorsMessages.push({
            message: 'incorrect availableResolutions value', field: 'availableResolutions'
        })
    }

    if (errors.errorsMessages.length) {
        res.status(400).json(errors)
        return
    }
    let today = new Date()
    let tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)
    const newProduct = {
        id: +(new Date()),
        title: req.body.title,
        author: req.body.author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: today.toISOString(),
        publicationDate: tomorrow.toISOString(),
        availableResolutions: req.body.availableResolutions
    }
    db.videos.push(newProduct)
    res.status(201).json(newProduct)
})

videosRouter.put('/:id', (req: Request<{ id: string }, {}, videosInputType>, res: Response<OutputType>) => {

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
            if (availableResolutions.includes(el)) {

            } else {
                errors.errorsMessages.push({
                    message: 'incorrect availableResolutions value', field: 'availableResolutions'
                })
            }
        })
    }

    if(req.body.availableResolutions.length ===0){
        errors.errorsMessages.push({
            message: 'incorrect availableResolutions value', field: 'availableResolutions'
        })
    }

    if (errors.errorsMessages.length) {
        res.status(400).json(errors)
        return
    }


    let id = +req.params.id
    let {title, author, canBeDownloaded, minAgeRestriction} = req.body
    let product = db.videos.find(p => p.id === id)
    if (product) {

        product.title = title
        product.author = author
        product.canBeDownloaded = canBeDownloaded
        product.minAgeRestriction = minAgeRestriction
        product.publicationDate = new Date().toISOString()
        product.availableResolutions = req.body.availableResolutions

        res.sendStatus(204)

    } else {
        res.sendStatus(404)
    }
})

videosRouter.delete('/:id', (req: Request, res: Response<OutputType>) => {
    for (let i = 0; i < db.videos.length; i++) {
        if (db.videos[i].id === +req.params.id) {
            db.videos.splice(i, 1);
            res.sendStatus(204)
            return
        }

    }

    res.sendStatus(404)

})

