import {db, deleteDB} from "../src/db/db";
import {req} from "./test-helpers";
import {SETTINGS} from "../src/settings";
import {blog1, codedAuth, createString, dataset1, dataset2} from "./helpers/datasets";
import {postsInoutData} from "../src/types/postType";
import {MongoMemoryServer} from "mongodb-memory-server";
import {blogsCollection, dbMongo, postsCollection} from "../src/db/dbInMongo";
import {postsRepository} from "../src/repositories/posts-repository";


describe('/posts', () => {
   /* beforeAll(async () => { // очистка базы данных перед началом тестирования
        const server = await MongoMemoryServer.create()
        const url = server.getUri()
        await runDb(url)
        await blogsCollection.deleteMany({})

    })
*/

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await dbMongo.run(mongoServer.getUri());
    })

    beforeEach(async () => {
        await dbMongo.drop();
    })

    afterAll(async () => {
        await dbMongo.stop();

    })

    afterAll(done => {
        done()
    })

    it('should create', async () => {
        //setDB(dataset1)
        await deleteDB()

        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        await blogsCollection.insertOne(datasetBlog)
        // @ts-ignore
        delete datasetBlog._id


        const newPost: postsInoutData = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: datasetBlog.id,
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost) // отправка данных
            .expect(201)

        // console.log(res.body)
        const posts = await postsCollection.find({}, {projection: {_id: 0}}).toArray()

        expect(res.body.title).toEqual(newPost.title)
        expect(res.body.shortDescription).toEqual(newPost.shortDescription)
        expect(res.body.content).toEqual(newPost.content)
        expect(res.body.blogId).toEqual(newPost.blogId)
        expect(res.body.blogName).toEqual(dataset1.blogs[0].name)
        expect(typeof res.body.id).toEqual('string')

        expect(res.body).toEqual(posts[0])
    })
    it('shouldn\'t create 401', async () => {

        await deleteDB()

        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        await blogsCollection.insertOne(datasetBlog)
        // @ts-ignore
        delete datasetBlog._id

        const newPost: postsInoutData = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: datasetBlog.id,
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .send(newPost) // отправка данных
            .expect(401)

        // console.log(res.body)

        expect(db.posts.length).toEqual(0)
    })
    it('shouldn\'t create', async () => {
        await deleteDB()
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
        await deleteDB()// очистка базы данных если нужно

        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200) // проверяем наличие эндпоинта

        // console.log(res.body) // можно посмотреть ответ эндпоинта

        expect(res.body.items.length).toEqual(0) // проверяем ответ эндпоинта
        expect(res.body.pagesCount).toEqual(0) // проверяем ответ эндпоинта
        expect(res.body.page).toEqual(1) // проверяем ответ эндпоинта
        expect(res.body.pageSize).toEqual(10) // проверяем ответ эндпоинта
        expect(res.body.totalCount).toEqual(0) // проверяем ответ эндпоинта
    })
    it('should get not empty array', async () => {
        //setDB(dataset2) // заполнение базы данных начальными данными если нужно
        await deleteDB()

        const datasetBlog = [{
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }, {
            id: String(+(new Date())),
            name: 'n7',
            description: 'd7',
            websiteUrl: 'http://some7.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }]

        const datasetPost = {
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog[0].id,
            blogName: 'n1',
            createdAt: new Date().toISOString()
        }


        await blogsCollection.insertMany(datasetBlog)
        await postsCollection.insertOne(datasetPost)

        // @ts-ignore
        delete datasetPost._id

        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        // console.log(res.body)

        expect(res.body.items.length).toEqual(1)
        expect(res.body.items[0]).toEqual(datasetPost)
    })

    it('should get post pagination', async () => {
        //setDB() // очистка базы данных если нужно

        await postsCollection.deleteMany({})
        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        await blogsCollection.insertOne(datasetBlog)

        const posts = [...new Array(300)].map((_, index) => ({
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog.id,
            blogName: 'n1',
            createdAt: new Date().toISOString()
        }))
        await postsCollection.insertMany(posts)

        const res = await req
            .get(SETTINGS.PATH.POSTS + '?pageNumber=5&pageSize=10')
            .expect(200)

        console.log(res.body)

        expect(res.body.items.length).toEqual(10)
        expect(res.body.pagesCount).toEqual(30)
        expect(res.body.page).toEqual(5)
        expect(res.body.pageSize).toEqual(10)
        expect(res.body.totalCount).toEqual(300)

    })


    it('shouldn\'t find', async () => {
        //setDB(dataset1)

        await deleteDB()

        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        await blogsCollection.insertOne(datasetBlog)
        // @ts-ignore
        delete datasetBlog._id

        const res = await req
            .get(SETTINGS.PATH.POSTS + '/1')
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('should find', async () => {
        //setDB(dataset2)

        await deleteDB()

        const datasetBlog = [{
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }, {
            id: String(+(new Date())),
            name: 'n7',
            description: 'd7',
            websiteUrl: 'http://some7.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }]

        const datasetPost = {
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog[0].id,
            blogName: 'n1',
            createdAt: new Date().toISOString()
        }

        await blogsCollection.insertMany(datasetBlog)
        await postsCollection.insertOne(datasetPost)

        // @ts-ignore
        delete datasetPost._id

        const res = await req
            .get(SETTINGS.PATH.POSTS + '/' + datasetPost.id)
            .expect(200) // проверка на ошибку

        // console.log(res.body)

        expect(res.body).toEqual(datasetPost)
    })
    it('should del', async () => {
        /// setDB(dataset2)

        await deleteDB()

        const datasetBlog = [{
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }, {
            id: String(+(new Date())),
            name: 'n7',
            description: 'd7',
            websiteUrl: 'http://some7.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }]

        const datasetPost = {
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: blog1.id,
            blogName: 'n1',
            createdAt: new Date().toISOString()
        }

        await blogsCollection.insertMany(datasetBlog)
        await postsCollection.insertOne(datasetPost)

        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/' + datasetPost.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(204) // проверка на ошибку

        // console.log(res.body)

        const posts = await postsCollection.find().toArray()

        expect(posts.length).toEqual(0)
    })
    it('shouldn\'t del', async () => {
        //setDB()
        await deleteDB()

        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('shouldn\'t del 401', async () => {
        // setDB()

        await deleteDB()

        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic' + codedAuth}) // no ' '
            .expect(401) // проверка на ошибку

        // console.log(res.body)
    })
    it('should update', async () => {
        //setDB(dataset2)

        await deleteDB()

        const datasetBlog = [{
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }, {
            id: String(+(new Date())),
            name: 'n7',
            description: 'd7',
            websiteUrl: 'http://some7.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }]

        const datasetPost = {
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog[0].id,
            blogName: 'n1',
            createdAt: new Date().toISOString()
        }

        await blogsCollection.insertMany(datasetBlog)
        await postsCollection.insertOne(datasetPost)

        // @ts-ignore
        delete datasetPost._id

        const post: postsInoutData = {
            title: 't2',
            shortDescription: 's2',
            content: 'c2',
            blogId: datasetBlog[0].id,
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/' + datasetPost.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(post)
            .expect(204) // проверка на ошибку

        const postUpdated = await postsCollection.findOne({id: datasetPost.id}, {projection: {_id: 0}})

        expect(postUpdated).toEqual({...datasetPost, ...post})
    })
    it('shouldn\'t update 404', async () => {
        //setDB(dataset1)

        await deleteDB()

        const datasetBlog = [{
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        },
            {
                id: String(+(new Date())),
                name: 'n7',
                description: 'd7',
                websiteUrl: 'http://some7.com',
                isMembership: false,
                createdAt: new Date().toISOString()
            }]

        const datasetPost = {
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog[0].id,
            blogName: 'n1',
            createdAt: new Date().toISOString()
        }

        await blogsCollection.insertMany(datasetBlog)
        await postsCollection.insertOne(datasetPost)

        const post: postsInoutData = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: datasetBlog[0].id,
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(post)
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('shouldn\'t update2', async () => {
        ///setDB(dataset2)

        await deleteDB()

        const datasetBlog = [{
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }, {
            id: String(+(new Date())),
            name: 'n7',
            description: 'd7',
            websiteUrl: 'http://some7.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }]

        const datasetPost = {
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: blog1.id,
            blogName: 'n1',
            createdAt: new Date().toISOString()
        }

        await blogsCollection.insertMany(datasetBlog)
        await postsCollection.insertOne(datasetPost)

        // @ts-ignore
        delete datasetPost._id
        // @ts-ignore
        delete datasetBlog[0]._id
        // @ts-ignore
        delete datasetBlog[1]._id

        const post: postsInoutData = {
            title: createString(31),
            content: createString(1001),
            shortDescription: createString(101),
            blogId: '1',
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/' + datasetPost.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(post)
            .expect(400) // проверка на ошибку

        // console.log(res.body)
        const blogs = await blogsCollection.find({}, {projection: {_id: 0}}).toArray()
        const posts = await postsCollection.find({}, {projection: {_id: 0}}).toArray()


        expect(blogs).toEqual(datasetBlog)
        expect(posts[0]).toEqual(datasetPost)
        expect(res.body.errorsMessages.length).toEqual(4)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')
        expect(res.body.errorsMessages[3].field).toEqual('blogId')
    })
    it('shouldn\'t update 401', async () => {
        /// setDB(dataset2)

        await deleteDB()

        const datasetBlog = [{
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }, {
            id: String(+(new Date())),
            name: 'n7',
            description: 'd7',
            websiteUrl: 'http://some7.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }]

        const datasetPost = {
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog[0].id,
            blogName: 'n1',
            createdAt: new Date().toISOString()
        }

        await blogsCollection.insertMany(datasetBlog)
        await postsCollection.insertOne(datasetPost)

        // @ts-ignore
        delete datasetPost._id
        // @ts-ignore
        delete datasetBlog[0]._id
        // @ts-ignore
        delete datasetBlog[1]._id

        const post: postsInoutData = {
            title: createString(31),
            content: createString(1001),
            shortDescription: createString(101),
            blogId: '1',
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/' + datasetPost.id)
            .set({'Authorization': 'Basic ' + codedAuth + 'error'})
            .send(post)
            .expect(401) // проверка на ошибку


        const blogs = await blogsCollection.find({}, {projection: {_id: 0}}).toArray()
        const posts = await postsCollection.find({}, {projection: {_id: 0}}).toArray()

        // console.log(res.body)


        expect(blogs).toEqual(datasetBlog)
        expect(posts[0]).toEqual(datasetPost)
    })
})