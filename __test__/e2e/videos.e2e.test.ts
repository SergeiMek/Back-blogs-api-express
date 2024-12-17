import {req} from './test-helpers'
import {HTTP_STATUSES, SETTINGS} from '../../src/settings'
import {inputVideoType} from "../../src/types/videosType";
import {dbMongo, videosCollection} from "../../src/db/dbInMongo";
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {videosMongooseModel} from "../../src/db/mongooseSchema/mongooseSchema";


describe(SETTINGS.PATH.VIDEOS, () => {
    /*beforeAll(async () => { // очистка базы данных перед началом тестирования
        /!*    await runDb(SETTINGS.MONGO_URL)
            await videosCollection.deleteMany()*!/

        const server = await MongoMemoryServer.create()
        const url = server.getUri()
        await runDb(url)
        await videosCollection.deleteMany({})

    })
*/
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        //await dbMongo.run(mongoServer.getUri());
        await mongoose.connect(mongoServer.getUri())
        await videosMongooseModel.deleteMany()
    })

    beforeEach(async () => {
       // await dbMongo.drop();
    })

    afterAll(async () => {
        //done()
        await mongoose.connection.close()
    })


    it('should get empty array', async () => {
        await videosMongooseModel.deleteMany()
        const res = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200) // проверяем наличие эндпоинта

        console.log(res.body) // можно посмотреть ответ эндпоинта

        expect(res.body.length).toBe(0) // проверяем ответ эндпоинта
    })
    it('should get not empty array', async () => {
        let dataset1 = {
            videos: [{
                id: +(new Date()),
                title: "ser",
                author: "post",
                canBeDownloaded: true,
                minAgeRestriction: 18,
                createdAt: "2024-10-10T12:39:24.849Z",
                publicationDate: "2024-10-10T12:40:20.013Z",
                availableResolutions: [
                    "P144"
                ]
            }]
        }

        await videosMongooseModel.deleteMany()
        // @ts-ignore
        await videosMongooseModel.insertMany(dataset1.videos)


        // @ts-ignore
        delete dataset1.videos[0]._id


        const res = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)
        console.log(res.body)
        expect(res.body.length).toBe(1)
        expect(res.body[0]).toEqual(dataset1.videos[0])
    })
    it('should create', async () => {
        await videosMongooseModel.deleteMany()

        const newVideo: inputVideoType /*InputVideoType*/ = {
            title: 't1',
            author: 'a1',
            availableResolutions: ['P144' /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(HTTP_STATUSES.CREATED_201)

        console.log(res.body)

        expect(res.body.availableResolutions).toEqual(newVideo.availableResolutions)

        const get = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        console.log(get.body)

        expect(get.body.length).toBe(1)
        expect(get.body[0].title).toEqual('t1')

    })

    it('shouldn\'t find', async () => {
        await videosMongooseModel.deleteMany()
        let dataset1 = {
            videos: [{
                id: +(new Date()),
                title: "ser",
                author: "post",
                canBeDownloaded: true,
                minAgeRestriction: 18,
                createdAt: "2024-10-10T12:39:24.849Z",
                publicationDate: "2024-10-10T12:40:20.013Z",
                availableResolutions: [
                    "P144"
                ]
            }]
        }

        // @ts-ignore
        //setDB(dataset1)

        //await  videosMongooseModel.insertOne(dataset1.videos[0])
        const smartUserModel = new videosMongooseModel(dataset1.videos[0])
        await smartUserModel.save()

        const res = await req
            .get(SETTINGS.PATH.VIDEOS + '/1')
            .expect(404) // проверка на ошибку

        console.log(res.body)
    })

    it('should create incorrect title ', async () => {

        await videosMongooseModel.deleteMany()

        const newVideo: inputVideoType /*InputVideoType*/ = {
            title: 't1000000000000000000000000000000000000000000000000000000000000000000000',
            author: 'a1',
            availableResolutions: ['P144' /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        console.log(res.body)

        expect(res.body).toEqual({
            errorsMessages: [{
                message: 'incorrect title value', field: 'title'
            }]
        })
    })


    it('should create incorrect author ', async () => {
        //setDB()

        await videosMongooseModel.deleteMany()

        const newVideo: inputVideoType /*InputVideoType*/ = {
            title: 't1',
            author: 'a10000000000000000000000000000000000000',
            availableResolutions: ['P144' /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        console.log(res.body)

        expect(res.body).toEqual({
            errorsMessages: [{
                message: 'incorrect author value', field: 'author'
            }]
        })
    })



    it('should create incorrect availableResolutions ', async () => {
        //  setDB()

        await videosMongooseModel.deleteMany()
        const newVideo: inputVideoType /*InputVideoType*/ = {
            title: 't1',
            author: 'a10',
            availableResolutions: [/*'P144'*/ /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        console.log(res.body)

        expect(res.body).toEqual({
            errorsMessages: [{
                message: 'incorrect availableResolutions value', field: 'availableResolutions'
            }]
        })
    })
    it('should create incorrect availableResolutions 2 ', async () => {
        // setDB()
        await videosMongooseModel.deleteMany()
        const newVideo: inputVideoType /*InputVideoType*/ = {
            title: 't1',
            author: 'a10',
            availableResolutions: ['P1446' /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        console.log(res.body)

        expect(res.body).toEqual({
            errorsMessages: [{
                message: 'incorrect availableResolutions value', field: 'availableResolutions'
            }]
        })
    })
    it('should update  video', async () => {

        // setDB()

        await videosMongooseModel.deleteMany()

        const newVideo: inputVideoType /*InputVideoType*/ = {
            title: 't1',
            author: 'a1',
            availableResolutions: ['P144' /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(HTTP_STATUSES.CREATED_201)

        console.log(res.body)

        expect(res.body.availableResolutions).toEqual(newVideo.availableResolutions)

        const get = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        console.log(get.body)


        expect(get.body.length).toBe(1)
        expect(get.body[0].title).toEqual(newVideo.title)
        // console.log(get.body[0].id)

        let updateVideo = {
            title: get.body[0].title,
            author: get.body[0].author,
            canBeDownloaded: true,
            minAgeRestriction: 18,
            publicationDate: new Date().toISOString(),
            availableResolutions: ['P144' /*Resolutions.P144*/]
        }


        const put = await req
            .put(SETTINGS.PATH.VIDEOS + '/' + String(get.body[0].id))
            .send(updateVideo)
            .expect(HTTP_STATUSES.NO_CONTEND_204)

        const getAfterPut = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        console.log(getAfterPut.body)

        expect(getAfterPut.body.length).toBe(1)
        expect(getAfterPut.body[0].canBeDownloaded).toEqual(true)
        expect(getAfterPut.body[0].minAgeRestriction).toEqual(18)
        // console.log(get.body[0].id)


    })

    it('no right Id', async () => {

        //setDB()
        await videosMongooseModel.deleteMany()

        const newVideo: inputVideoType /*InputVideoType*/ = {
            title: 't1',
            author: 'a1',
            availableResolutions: ['P144' /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(HTTP_STATUSES.CREATED_201)

        console.log(res.body)

        expect(res.body.availableResolutions).toEqual(newVideo.availableResolutions)

        const get = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        console.log(get.body)


        expect(get.body.length).toBe(1)
        expect(get.body[0].title).toEqual(newVideo.title)
        // console.log(get.body[0].id)

        let updateVideo = {
            title: get.body[0].title,
            author: get.body[0].author,
            canBeDownloaded: true,
            minAgeRestriction: 18,
            publicationDate: new Date().toISOString(),
            availableResolutions: ['P144' /*Resolutions.P144*/]
        }


        const put = await req
            .put(SETTINGS.PATH.VIDEOS + '/' + '1')
            .send(updateVideo)
            .expect(HTTP_STATUSES.NOT_FOUNT_404)


    })
    it('should update  video', async () => {

        // setDB()

        await videosMongooseModel.deleteMany()

        const newVideo: inputVideoType /*InputVideoType*/ = {
            title: 't1',
            author: 'a1',
            availableResolutions: ['P144' /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(HTTP_STATUSES.CREATED_201)

        console.log(res.body)

        expect(res.body.availableResolutions).toEqual(newVideo.availableResolutions)

        const get = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        console.log(get.body)


        expect(get.body.length).toBe(1)
        expect(get.body[0].title).toEqual(newVideo.title)
        // console.log(get.body[0].id)

        let updateVideo = {
            title: get.body[0].title,
            author: get.body[0].author,
            canBeDownloaded: true,
            minAgeRestriction: 18,
            publicationDate: new Date().toISOString(),
            availableResolutions: ['P144' /*Resolutions.P144*/]
        }


        const put = await req
            .put(SETTINGS.PATH.VIDEOS + '/' + String(get.body[0].id))
            .send(updateVideo)
            .expect(HTTP_STATUSES.NO_CONTEND_204)

        const getAfterPut = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        console.log(getAfterPut.body)

        expect(getAfterPut.body.length).toBe(1)
        expect(getAfterPut.body[0].canBeDownloaded).toEqual(true)
        expect(getAfterPut.body[0].minAgeRestriction).toEqual(18)
        // console.log(get.body[0].id)


    })

    it('no right Id', async () => {

        //setDB()
        await videosMongooseModel.deleteMany()

        const newVideo: inputVideoType /*InputVideoType*/ = {
            title: 't1',
            author: 'a1',
            availableResolutions: ['P144' /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(HTTP_STATUSES.CREATED_201)

        console.log(res.body)

        expect(res.body.availableResolutions).toEqual(newVideo.availableResolutions)

        const get = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        console.log(get.body)


        expect(get.body.length).toBe(1)
        expect(get.body[0].title).toEqual(newVideo.title)
        // console.log(get.body[0].id)

        let updateVideo = {
            title: get.body[0].title,
            author: get.body[0].author,
            canBeDownloaded: true,
            minAgeRestriction: 18,
            publicationDate: new Date().toISOString(),
            availableResolutions: ['P144' /*Resolutions.P144*/]
        }


        const put = await req
            .put(SETTINGS.PATH.VIDEOS + '/' + '1')
            .send(updateVideo)
            .expect(HTTP_STATUSES.NOT_FOUNT_404)


    })

    it('should update  video', async () => {

        // setDB()

        await videosMongooseModel.deleteMany()

        const newVideo: inputVideoType /*InputVideoType*/ = {
            title: 't1',
            author: 'a1',
            availableResolutions: ['P144' /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(HTTP_STATUSES.CREATED_201)

        console.log(res.body)

        expect(res.body.availableResolutions).toEqual(newVideo.availableResolutions)

        const get = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        console.log(get.body)


        expect(get.body.length).toBe(1)
        expect(get.body[0].title).toEqual(newVideo.title)
        // console.log(get.body[0].id)

        let updateVideo = {
            title: get.body[0].title,
            author: get.body[0].author,
            canBeDownloaded: true,
            minAgeRestriction: 18,
            publicationDate: new Date().toISOString(),
            availableResolutions: ['P144' /*Resolutions.P144*/]
        }


        const put = await req
            .put(SETTINGS.PATH.VIDEOS + '/' + String(get.body[0].id))
            .send(updateVideo)
            .expect(HTTP_STATUSES.NO_CONTEND_204)

        const getAfterPut = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        console.log(getAfterPut.body)

        expect(getAfterPut.body.length).toBe(1)
        expect(getAfterPut.body[0].canBeDownloaded).toEqual(true)
        expect(getAfterPut.body[0].minAgeRestriction).toEqual(18)
        // console.log(get.body[0].id)


    })

    it('no right Id', async () => {

        //setDB()
        await videosMongooseModel.deleteMany()

        const newVideo: inputVideoType /*InputVideoType*/ = {
            title: 't1',
            author: 'a1',
            availableResolutions: ['P144' /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(HTTP_STATUSES.CREATED_201)

        console.log(res.body)

        expect(res.body.availableResolutions).toEqual(newVideo.availableResolutions)

        const get = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        console.log(get.body)


        expect(get.body.length).toBe(1)
        expect(get.body[0].title).toEqual(newVideo.title)
        // console.log(get.body[0].id)

        let updateVideo = {
            title: get.body[0].title,
            author: get.body[0].author,
            canBeDownloaded: true,
            minAgeRestriction: 18,
            publicationDate: new Date().toISOString(),
            availableResolutions: ['P144' /*Resolutions.P144*/]
        }


        const put = await req
            .put(SETTINGS.PATH.VIDEOS + '/' + '1')
            .send(updateVideo)
            .expect(HTTP_STATUSES.NOT_FOUNT_404)


    })

    it('delete video', async () => {
        await videosMongooseModel.deleteMany()
        ///setDB()

        const get = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        console.log(get.body)

        expect(get.body.length).toBe(0)


        const newVideo: inputVideoType /*InputVideoType*/ = {
            title: 't1',
            author: 'a1',
            availableResolutions: ['P144' /*Resolutions.P144*/]
            // ...
        }

        const post = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(HTTP_STATUSES.CREATED_201)

        console.log(post.body)

        expect(post.body.availableResolutions).toEqual(newVideo.availableResolutions)
        expect(post.body.title).toEqual(newVideo.title)

        const get2 = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        expect(get2.body.length).toBe(1)
        expect(get2.body[0].title).toEqual(newVideo.title)

        const deleteVideo = await req
            .delete(SETTINGS.PATH.VIDEOS + '/' + String(get2.body[0].id))
            .expect(HTTP_STATUSES.NO_CONTEND_204)

        const get3 = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)


        expect(get3.body.length).toBe(0)
    })


    it('no right Id', async () => {

        //setDB()
        await videosMongooseModel.deleteMany()

        const get = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)


        expect(get.body.length).toBe(0)


        const deleteVideo = await req
            .delete(SETTINGS.PATH.VIDEOS + '/' + '1')
            .expect(HTTP_STATUSES.NOT_FOUNT_404)


    })
})



