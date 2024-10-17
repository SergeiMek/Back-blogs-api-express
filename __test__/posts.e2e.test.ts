import {db, setDB} from "../src/db/db";
import {blogInputData} from "../src/types/blogType";
import {req} from "./test-helpers";
import {SETTINGS} from "../src/settings";
import {codedAuth, createString, dataset1, dataset2} from "./helpers/datasets";
import {postsInoutData} from "../src/types/postType";


describe('/posts', () => {
    // beforeAll(async () => { // очистка базы данных перед началом тестирования
    //     setDB()
    // })

    it('should create', async () => {
        setDB(dataset1)
        const newPost: postsInoutData = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: dataset1.blogs[0].id,
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost) // отправка данных
            .expect(201)

        // console.log(res.body)

        expect(res.body.title).toEqual(newPost.title)
        expect(res.body.shortDescription).toEqual(newPost.shortDescription)
        expect(res.body.content).toEqual(newPost.content)
        expect(res.body.blogId).toEqual(newPost.blogId)
        expect(res.body.blogName).toEqual(dataset1.blogs[0].name)
        expect(typeof res.body.id).toEqual('string')

        expect(res.body).toEqual(db.posts[0])
    })
    it('shouldn\'t create 401', async () => {
        setDB(dataset1)
        const newPost: postsInoutData = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: dataset1.blogs[0].id,
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .send(newPost) // отправка данных
            .expect(401)

        // console.log(res.body)

        expect(db.posts.length).toEqual(0)
    })
    it('shouldn\'t create', async () => {
        setDB()
        const newPost: postsInoutData = {
            title: createString(31),
            content: createString(1001),
            shortDescription: createString(101),
            blogId: '1',
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost) // отправка данных
            .expect(400)

        // console.log(res.body)

        expect(res.body.errorsMessages.length).toEqual(4)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')
        expect(res.body.errorsMessages[3].field).toEqual('blogId')

        expect(db.posts.length).toEqual(0)
    })
    it('should get empty array', async () => {
        setDB() // очистка базы данных если нужно

        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200) // проверяем наличие эндпоинта

        // console.log(res.body) // можно посмотреть ответ эндпоинта

        expect(res.body.length).toEqual(0) // проверяем ответ эндпоинта
    })
    it('should get not empty array', async () => {
        setDB(dataset2) // заполнение базы данных начальными данными если нужно

        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        // console.log(res.body)

        expect(res.body.length).toEqual(1)
        expect(res.body[0]).toEqual(dataset2.posts[0])
    })
    it('shouldn\'t find', async () => {
        setDB(dataset1)

        const res = await req
            .get(SETTINGS.PATH.POSTS + '/1')
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('should find', async () => {
        setDB(dataset2)

        const res = await req
            .get(SETTINGS.PATH.POSTS + '/' + dataset2.posts[0].id)
            .expect(200) // проверка на ошибку

        // console.log(res.body)

        expect(res.body).toEqual(dataset2.posts[0])
    })
    it('should del', async () => {
        setDB(dataset2)

        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/' + dataset2.posts[0].id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(204) // проверка на ошибку

        // console.log(res.body)

        expect(db.posts.length).toEqual(0)
    })
    it('shouldn\'t del', async () => {
        setDB()

        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('shouldn\'t del 401', async () => {
        setDB()

        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic' + codedAuth}) // no ' '
            .expect(401) // проверка на ошибку

        // console.log(res.body)
    })
    it('should update', async () => {
        setDB(dataset2)
        const post: postsInoutData = {
            title: 't2',
            shortDescription: 's2',
            content: 'c2',
            blogId: dataset2.blogs[1].id,
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/' + dataset2.posts[0].id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(post)
            .expect(204) // проверка на ошибку



        expect(db.posts[0]).toEqual({...db.posts[0], ...post, blogName: dataset2.blogs[1].name})
    })
    it('shouldn\'t update 404', async () => {
        setDB(dataset1)

        const post: postsInoutData = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: dataset1.blogs[0].id,
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(post)
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('shouldn\'t update2', async () => {
        setDB(dataset2)
        const post: postsInoutData = {
            title: createString(31),
            content: createString(1001),
            shortDescription: createString(101),
            blogId: '1',
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/' + dataset2.posts[0].id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(post)
            .expect(400) // проверка на ошибку

        // console.log(res.body)

        expect(db).toEqual(dataset2)
        expect(res.body.errorsMessages.length).toEqual(4)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')
        expect(res.body.errorsMessages[3].field).toEqual('blogId')
    })
    it('shouldn\'t update 401', async () => {
        setDB(dataset2)
        const post: postsInoutData = {
            title: createString(31),
            content: createString(1001),
            shortDescription: createString(101),
            blogId: '1',
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/' + dataset2.posts[0].id)
            .set({'Authorization': 'Basic ' + codedAuth + 'error'})
            .send(post)
            .expect(401) // проверка на ошибку

        // console.log(res.body)

        expect(db).toEqual(dataset2)
    })
})