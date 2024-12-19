import {blogInputData} from "../../src/types/blogType";
import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";
import {codedAuth, createString} from "./helpers/datasets";
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {blogsMongooseModel, videosMongooseModel} from "../../src/db/mongooseSchema/mongooseSchema";



describe('/blogs', () => {

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


    it('should create', async () => {
        // setDB()
        await blogsMongooseModel.deleteMany()

        const newBlog: blogInputData = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog) // отправка данных
            .expect(201)

        //console.log(res.body)

        const blogs = await blogsMongooseModel.find({}, {_id: 0}).lean()

        expect(res.body.name).toEqual(newBlog.name)
        expect(res.body.description).toEqual(newBlog.description)
        expect(res.body.websiteUrl).toEqual(newBlog.websiteUrl)
        expect(typeof res.body.id).toEqual('string')

        expect(res.body).toEqual(blogs[0])
    })
    it('shouldn\'t create 401', async () => {
        //setDB()

        await blogsMongooseModel.deleteMany({})

        const newBlog: blogInputData = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog) // отправка данных
            .expect(401)

        // console.log(res.body)
        const blogs = await blogsMongooseModel.find()
        expect(blogs.length).toEqual(0)
    })

    it('search term for blog name', async () => {
        //setDB() // очистка базы данных если нужно

        await blogsMongooseModel.deleteMany({})


        const blogs = [{
            id: String(+(new Date())),
            createdAt: new Date().toISOString(),
            isMembership: false,
            name: 'sergei',
            description: 'n1',
            websiteUrl: 'https://some.com'
        }, {
            id: String(+(new Date())),
            createdAt: new Date().toISOString(),
            isMembership: false,
            name: 'ilia',
            description: 'n1',
            websiteUrl: 'https://some.com'
        },
            {
                id: String(+(new Date())),
                createdAt: new Date().toISOString(),
                isMembership: false,
                name: 'nikita',
                description: 'n1',
                websiteUrl: 'https://some.com'
            }, {
                id: String(+(new Date())),
                createdAt: new Date().toISOString(),
                isMembership: false,
                name: 'nikita2',
                description: 'n1',
                websiteUrl: 'https://some.com'
            }
        ]
        await blogsMongooseModel.insertMany(blogs)

        const res = await req
            .get(SETTINGS.PATH.BLOGS + '?searchNameTerm=ki')
            .expect(200)

        //console.log(res.body)

        expect(res.body.items.length).toEqual(2)
        expect(res.body.pagesCount).toEqual(1)
        expect(res.body.page).toEqual(1)
        expect(res.body.pageSize).toEqual(10)
        expect(res.body.totalCount).toEqual(2)
    })
    it('shouldn\'t create', async () => {

        await blogsMongooseModel.deleteMany({})

        const newBlog: blogInputData = {
            name: createString(16),
            description: createString(501),
            websiteUrl: createString(101),
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog) // отправка данных
            .expect(400)

        //console.log(res.body.errorsMessages)
        const blogs = await blogsMongooseModel.find()

        expect(res.body.errorsMessages.length).toEqual(3)
        expect(res.body.errorsMessages[0].field).toEqual('name')
        expect(res.body.errorsMessages[1].field).toEqual('description')
        expect(res.body.errorsMessages[2].field).toEqual('websiteUrl')

        expect(blogs.length).toEqual(0)
    })
    it('should get post in blog', async () => {
        //setDB() // очистка базы данных если нужно

        await blogsMongooseModel.deleteMany({})

        const newBlog: blogInputData = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog) // отправка данных
            .expect(201)

        const blogId = res.body.id

        const resPostsInBlog = await req
            .get(`${SETTINGS.PATH.BLOGS + '/' + blogId + '/posts'}`)
            .expect(200) // проверяем наличие эндпоинта
        console.log(resPostsInBlog.body) // можно посмотреть ответ эндпоинта

        expect(resPostsInBlog.body.items.length).toEqual(0)
        expect(resPostsInBlog.body.pagesCount).toEqual(0)
        expect(resPostsInBlog.body.page).toEqual(1)
        expect(resPostsInBlog.body.pageSize).toEqual(10)
        expect(resPostsInBlog.body.totalCount).toEqual(0)

    })
    it('should get blogs pagination', async () => {
        //setDB() // очистка базы данных если нужно

        await blogsMongooseModel.deleteMany({})


        const blogs = [...new Array(300)].map((_, index) => ({
            id: String(+(new Date())) + index,
            createdAt: new Date().toISOString(),
            isMembership: false,
            name: 'n1',
            description: 'n1',
            websiteUrl: 'https://some.com'
        }))
        await blogsMongooseModel.insertMany(blogs)

        const res = await req
            .get(SETTINGS.PATH.BLOGS + '?pageNumber=5&pageSize=7')
            .expect(200)

        //console.log(res.body)

        expect(res.body.items.length).toEqual(7)
        expect(res.body.pagesCount).toEqual(43)
        expect(res.body.page).toEqual(5)
        expect(res.body.pageSize).toEqual(7)
        expect(res.body.totalCount).toEqual(300)

    })

    it('created post in blog', async () => {
        //setDB() // очистка базы данных если нужно

        await blogsMongooseModel.deleteMany({})

        const newBlog: blogInputData = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog) // отправка данных
            .expect(201)

        const blogId = res.body.id

        const post = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
        }

        const resPostsInBlog = await req
            .post(`${SETTINGS.PATH.BLOGS + '/' + blogId + '/posts'}`)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(post)
            .expect(201) // проверяем наличие эндпоинта

        const getPostsInBlog = await req
            .get(`${SETTINGS.PATH.BLOGS + '/' + blogId + '/posts'}`)
            .expect(200)


        expect(resPostsInBlog.body.blogId).toBe(blogId)
        expect(resPostsInBlog.body.blogName).toBe(newBlog.name)
        expect(resPostsInBlog.body.title).toBe(post.title)
        expect(resPostsInBlog.body.shortDescription).toBe(post.shortDescription)
        expect(resPostsInBlog.body.content).toBe(post.content)
        expect(getPostsInBlog.body.items.length).toEqual(1)
        expect(getPostsInBlog.body.items[0]).toEqual(resPostsInBlog.body)

    })


    it('should get empty array', async () => {
        //setDB() // очистка базы данных если нужно

        await blogsMongooseModel.deleteMany({})

        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200) // проверяем наличие эндпоинта

        // console.log(res.body) // можно посмотреть ответ эндпоинта

        expect(res.body.items.length).toEqual(0) // проверяем ответ эндпоинта
    })
    it('should get not empty array', async () => {

        const dataset = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }


        /// await blogsMongooseModel.insertOne(dataset)

        const smartBlogModel = new blogsMongooseModel(dataset)
        await smartBlogModel.save()

        // @ts-ignore
        delete dataset._id
        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        // console.log(res.body)

        expect(res.body.items.length).toEqual(1)
        expect(res.body.items[0]).toEqual(dataset)
        expect(res.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [dataset]
        })
    })
    it('shouldn\'t find', async () => {
        //setDB(dataset1)

        const dataset = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }
        //await blogsCollection.insertOne(dataset)

        const smartBlogModel = new blogsMongooseModel(dataset)
        await smartBlogModel.save()

        const res = await req
            .get(SETTINGS.PATH.BLOGS + '/1')
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('should find', async () => {
        const dataset = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }
        /// await blogsCollection.insertOne(dataset)

        const smartBlogModel = new blogsMongooseModel(dataset)
        await smartBlogModel.save()

        // @ts-ignore
        delete dataset._id

        const res = await req
            .get(SETTINGS.PATH.BLOGS + '/' + dataset.id)
            .expect(200) // проверка на ошибку

        // console.log(res.body)

        expect(res.body).toEqual(dataset)
    })
    it('should del', async () => {
        //setDB(dataset1)
        await blogsMongooseModel.deleteMany()
        const dataset = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }
        //await blogsCollection.insertOne(dataset)

        const smartBlogModel = new blogsMongooseModel(dataset)
        await smartBlogModel.save()

        const res = await req
            .delete(SETTINGS.PATH.BLOGS + '/' + dataset.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(204) // проверка на ошибку

        // console.log(res.body)
        const deleted = await blogsMongooseModel.find()

        expect(deleted).toEqual([])
    })
    it('shouldn\'t del', async () => {
        // setDB()
        await blogsMongooseModel.deleteMany()

        const res = await req
            .delete(SETTINGS.PATH.BLOGS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('shouldn\'t del 401', async () => {
        //setDB()

        await blogsMongooseModel.deleteMany()

        const res = await req
            .delete(SETTINGS.PATH.BLOGS + '/1')
            .set({'Authorization': 'Basic' + codedAuth}) // no ' '
            .expect(401) // проверка на ошибку

        // console.log(res.body)
    })
    it('should update', async () => {
        //setDB(dataset1)

        const dataset = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }
        /// await blogsMongooseModel.insertOne(dataset)
        const smartBlogModel = new blogsMongooseModel(dataset)
        await smartBlogModel.save()

        const blog: blogInputData = {
            name: 'n2',
            description: 'd2',
            websiteUrl: 'https://some2.com',
        }

        const res = await req
            .put(SETTINGS.PATH.BLOGS + '/' + dataset.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(blog)
            .expect(204) // проверка на ошибку

        console.log(res.body)

        const blogData = await blogsMongooseModel.findOne({id: dataset.id}).select('-_id').lean()


        expect(blogData).toEqual({
            ...dataset,
            name: 'n2',
            description: 'd2',
            websiteUrl: 'https://some2.com',

        })


    })
    it('shouldn\'t update 404', async () => {
        /// setDB()
        await blogsMongooseModel.deleteMany()

        const blog: blogInputData = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
        }
        const res = await req
            .put(SETTINGS.PATH.BLOGS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(blog)
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })

    it('shouldn\'t update2', async () => {
        //setDB(dataset1)
        await blogsMongooseModel.deleteMany()

        const dataset = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        const smartBlogModel = new blogsMongooseModel(dataset)
        await smartBlogModel.save()


        ///await blogsCollection.insertOne(dataset)

        // @ts-ignore
        delete dataset._id

        const blog: blogInputData = {
            name: createString(16),
            description: createString(501),
            websiteUrl: createString(101),
        }

        const res = await req
            .put(SETTINGS.PATH.BLOGS + '/' + dataset.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(blog)
            .expect(400) // проверка на ошибку

        const createdBlog = await blogsMongooseModel.findOne({id: dataset.id}, {_id: 0}).lean()
        // console.log(res.body)

        expect(createdBlog).toEqual(dataset)
        expect(res.body.errorsMessages.length).toEqual(3)
        expect(res.body.errorsMessages[0].field).toEqual('name')
        expect(res.body.errorsMessages[1].field).toEqual('description')
        expect(res.body.errorsMessages[2].field).toEqual('websiteUrl')
    })
    it('shouldn\'t update 401', async () => {
        //setDB(dataset1)
        await blogsMongooseModel.deleteMany()
        const dataset = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }
        //  await blogsCollection.insertOne(dataset)
        const smartBlogModel = new blogsMongooseModel(dataset)
        await smartBlogModel.save()

        // @ts-ignore
        delete dataset._id

        const blog: blogInputData = {
            name: createString(16),
            description: createString(501),
            websiteUrl: createString(101),
        }

        const res = await req
            .put(SETTINGS.PATH.BLOGS + '/' + dataset.id)
            .set({'Authorization': 'Basic ' + codedAuth + 'error'})
            .send(blog)
            .expect(401) // проверка на ошибку


        const createdBlog = await blogsMongooseModel.findOne({id: dataset.id}, {_id: 0}).lean()
        // console.log(res.body)

        expect(createdBlog).toEqual(dataset)
    })

})