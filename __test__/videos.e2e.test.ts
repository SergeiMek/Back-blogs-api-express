import {req} from './test-helpers'
import {HTTP_STATUSES, SETTINGS} from '../src/settings'
import {setDB} from "../src/db/db";
import {inputVideoType} from "../src/types/videosType";

describe(SETTINGS.PATH.VIDEOS, () => {
    beforeAll(async () => { // очистка базы данных перед началом тестирования
        setDB()
    })

    it('should get empty array', async () => {
        setDB() // очистка базы данных если нужно

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
        // @ts-ignore
        setDB(dataset1) // заполнение базы данных начальными данными если нужно

        const res = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)

        console.log(res.body)

        expect(res.body.length).toBe(1)
        expect(res.body[0]).toEqual(dataset1.videos[0])
    })
})

describe(SETTINGS.PATH.VIDEOS, () => {
    /*  beforeAll(async () => { // очистка базы данных перед началом тестирования
          setDB()
      })*/
//post
    it('should create', async () => {
        setDB()
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
        setDB(dataset1)

        const res = await req
            .get(SETTINGS.PATH.VIDEOS + '/1')
            .expect(404) // проверка на ошибку

        console.log(res.body)
    })

    it('should create incorrect title ', async () => {
        setDB()
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

    it('check for string title ', async () => {
        setDB()
        const newVideo: any /*InputVideoType*/ = {
            title: 5,
            author: 'a1',
            availableResolutions: ['P144' /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(500)

        console.log(res.body)

        expect(res.body).toEqual({})
    })

    it('should create incorrect author ', async () => {
        setDB()
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

    it('check for string author ', async () => {
        setDB()
        const newVideo: any /*InputVideoType*/ = {
            title: "666",
            author: true,
            availableResolutions: ['P144' /*Resolutions.P144*/]
            // ...
        }

        const res = await req
            .post(SETTINGS.PATH.VIDEOS)
            .send(newVideo) // отправка данных
            .expect(500)

        console.log(res.body)

        expect(res.body).toEqual({})
    })

    it('should create incorrect availableResolutions ', async () => {
        setDB()
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
        setDB()
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
})


describe(SETTINGS.PATH.VIDEOS, () => {
    // обнавление (put)

   /* beforeAll(async () => { // очистка базы данных перед началом тестирования
        setDB()
    })*/

    it('should update  video', async () => {

        setDB()

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
            .put(SETTINGS.PATH.VIDEOS +'/' + String(get.body[0].id))
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

        setDB()

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
            .put(SETTINGS.PATH.VIDEOS +'/' + '1')
            .send(updateVideo)
            .expect(HTTP_STATUSES.NOT_FOUNT_404)


    })
})

describe(SETTINGS.PATH.VIDEOS, () => {
    // удаление (delete)

    /* beforeAll(async () => { // очистка базы данных перед началом тестирования
         setDB()
     })*/

    it('delete video', async () => {

        setDB()

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
            .delete(SETTINGS.PATH.VIDEOS  +'/' + String(get2.body[0].id))
            .expect(HTTP_STATUSES.NO_CONTEND_204)

    const get3 = await req
        .get(SETTINGS.PATH.VIDEOS)
        .expect(HTTP_STATUSES.OK_200)


        expect(get3.body.length).toBe(0)
    })





    it('no right Id', async () => {

        setDB()

        const get = await req
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200)


        expect(get.body.length).toBe(0)


        const deleteVideo = await req
            .delete(SETTINGS.PATH.VIDEOS +'/' + '1')
            .expect(HTTP_STATUSES.NOT_FOUNT_404)


    })
})
