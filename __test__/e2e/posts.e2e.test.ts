import {db} from "../../src/db/db";
import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";
import {blog1, codedAuth, createComment, createOneUser, createString, dataset1} from "./helpers/datasets";
import {postsInoutData} from "../../src/types/postType";
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {
    blogsMongooseModel, commentsMongooseModel, limitsMongooseModel,
    postsMongooseModel,
    usersMongooseModel,
    videosMongooseModel
} from "../../src/db/mongooseSchema/mongooseSchema";


describe('/posts', () => {


    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        //await dbMongo.run(mongoServer.getUri());
        await mongoose.connect(mongoServer.getUri())
        await videosMongooseModel.deleteMany()
    })

    beforeEach(async () => {
        // await dbMongo.drop();
        await postsMongooseModel.deleteMany()
        await blogsMongooseModel.deleteMany()
        await usersMongooseModel.deleteMany()
        await limitsMongooseModel.deleteMany()
    })

    afterAll(async () => {
        //done()
        await mongoose.connection.close()
    })

    it('should create', async () => {
        //setDB(dataset1)
        //await deleteDB()

        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }


        ///await blogsCollection.insertOne(datasetBlog)
        const smartBlogModel = new blogsMongooseModel(datasetBlog);
        await smartBlogModel.save();
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


        const posts = await postsMongooseModel.find({}, {_id: 0}).lean()

        expect(res.body.title).toEqual(newPost.title)
        expect(res.body.shortDescription).toEqual(newPost.shortDescription)
        expect(res.body.content).toEqual(newPost.content)
        expect(res.body.blogId).toEqual(newPost.blogId)
        expect(res.body.blogName).toEqual(dataset1.blogs[0].name)
        expect(typeof res.body.id).toEqual('string')
        expect(res.body.extendedLikesInfo.likesCount).toEqual(posts[0].likesInfo.likesCount)
        expect(res.body.extendedLikesInfo.dislikesCount).toEqual(posts[0].likesInfo.dislikesCount)
        expect(res.body.extendedLikesInfo.newestLikes).toEqual(posts[0].likesInfo.users)

    })
    it('shouldn\'t create 401', async () => {


        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }


        const smartUserModel = new blogsMongooseModel(datasetBlog);
        await smartUserModel.save();


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


        expect(db.posts.length).toEqual(0)
    })
    it('shouldn\'t create', async () => {
        //await deleteDB()
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


        expect(res.body.errorsMessages.length).toEqual(4)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')
        expect(res.body.errorsMessages[3].field).toEqual('blogId')

        expect(db.posts.length).toEqual(0)
    })
    it('should get empty array', async () => {


        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200) // проверяем наличие эндпоинта


        expect(res.body.items.length).toEqual(0) // проверяем ответ эндпоинта
        expect(res.body.pagesCount).toEqual(0) // проверяем ответ эндпоинта
        expect(res.body.page).toEqual(1) // проверяем ответ эндпоинта
        expect(res.body.pageSize).toEqual(10) // проверяем ответ эндпоинта
        expect(res.body.totalCount).toEqual(0) // проверяем ответ эндпоинта
    })
    it('should get not empty array', async () => {


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
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }


        await blogsMongooseModel.insertMany(datasetBlog)


        const smartPostModel = new postsMongooseModel(datasetPost);
        await smartPostModel.save();
        // @ts-ignore
        delete datasetPost._id

        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)


        expect(res.body.items.length).toEqual(1)

    })

    it('should get post pagination', async () => {


        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        const smartBlogModel = new blogsMongooseModel(datasetBlog)
        await smartBlogModel.save()
        ///await blogsCollection.insertOne(datasetBlog)

        const posts = [...new Array(300)].map((_, index) => ({
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog.id,
            blogName: 'n1',
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }))
        await postsMongooseModel.insertMany(posts)

        const res = await req
            .get(SETTINGS.PATH.POSTS + '?pageNumber=5&pageSize=10')
            .expect(200)


        expect(res.body.items.length).toEqual(10)
        expect(res.body.pagesCount).toEqual(30)
        expect(res.body.page).toEqual(5)
        expect(res.body.pageSize).toEqual(10)
        expect(res.body.totalCount).toEqual(300)

    })


    it('shouldn\'t find', async () => {


        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        ///await blogsCollection.insertOne(datasetBlog)
        const smartBlogModel = new blogsMongooseModel(datasetBlog)
        await smartBlogModel.save()

        // @ts-ignore
        delete datasetBlog._id

        const res = await req
            .get(SETTINGS.PATH.POSTS + '/1')
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('should find', async () => {
        //setDB(dataset2)


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
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }

        await blogsMongooseModel.insertMany(datasetBlog)
        //await postsCollection.insertOne(datasetPost)


        const smartPostModel = new postsMongooseModel(datasetPost)
        await smartPostModel.save()
        // @ts-ignore
        delete datasetPost._id

        const res = await req
            .get(SETTINGS.PATH.POSTS + '/' + datasetPost.id)
            .expect(200) // проверка на ошибку

        // console.log(res.body)

        // expect(res.body).toEqual(datasetPost)
    })
    it('should del', async () => {
        /// setDB(dataset2)


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
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }

        await blogsMongooseModel.insertMany(datasetBlog)
        ////await postsCollection.insertOne(datasetPost)

        const smartPostModel = new postsMongooseModel(datasetPost)
        await smartPostModel.save()

        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/' + datasetPost.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(204) // проверка на ошибку

        // console.log(res.body)

        const posts = await postsMongooseModel.find().lean()

        expect(posts.length).toEqual(0)
    })
    it('shouldn\'t del', async () => {
        //setDB()


        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('shouldn\'t del 401', async () => {
        // setDB()


        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic' + codedAuth}) // no ' '
            .expect(401) // проверка на ошибку

        // console.log(res.body)
    })
    it('should update', async () => {
        //setDB(dataset2)


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
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }

        await blogsMongooseModel.insertMany(datasetBlog)
        ///await postsCollection.insertOne(datasetPost)

        const smartPostModel = new postsMongooseModel(datasetPost)
        await smartPostModel.save()

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

        const postUpdated = await postsMongooseModel.findOne({id: datasetPost.id}, {_id: 0}).lean()

        expect(postUpdated).toEqual({...datasetPost, ...post})
    })
    it('shouldn\'t update 404', async () => {
        //setDB(dataset1)


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
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }

        await blogsMongooseModel.insertMany(datasetBlog)
        ////await postsCollection.insertOne(datasetPost)

        const smartPostModel = new postsMongooseModel(datasetPost)
        await smartPostModel.save()

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
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }

        await blogsMongooseModel.insertMany(datasetBlog)
        ///// await postsCollection.insertOne(datasetPost)


        const smartPostModel = new postsMongooseModel(datasetPost)
        await smartPostModel.save()

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
        const blogs = await blogsMongooseModel.find({}, {_id: 0}).lean()
        const posts = await postsMongooseModel.find({}, {_id: 0}).lean()


        expect(blogs).toEqual(datasetBlog)
        expect(posts[0]).toEqual(datasetPost)
        expect(res.body.errorsMessages.length).toEqual(4)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')
        expect(res.body.errorsMessages[3].field).toEqual('blogId')
    })
    it('shouldn\'t update 401', async () => {


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
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }

        await blogsMongooseModel.insertMany(datasetBlog)
        ////await postsCollection.insertOne(datasetPost)

        const smartPostModel = new postsMongooseModel(datasetPost)
        await smartPostModel.save()

        /* // @ts-ignore
         delete datasetPost._id
         // @ts-ignore
         delete datasetBlog[0]._id
         // @ts-ignore
         delete datasetBlog[1]._id*/

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


        const blogs = await blogsMongooseModel.find({}, {_id: 0}).lean()
        const posts = await postsMongooseModel.find({}, {_id: 0}).lean()

        // console.log(res.body)


        expect(blogs).toEqual(datasetBlog)
        expect(posts[0]).toEqual(datasetPost)
    })
    it('return comment for specified post 200', async () => {

        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        const posts = [...new Array(1)].map((_, index) => ({
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog.id,
            blogName: 'n1',
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }))
        await blogsMongooseModel.create(datasetBlog)
        await postsMongooseModel.insertMany(posts)
        const postId = posts[0].id

        const res = await req
            .get(SETTINGS.PATH.POSTS + '/' + postId + '/comments')
            .expect(200)


        expect(res.body.items.length).toEqual(0)
        expect(res.body.pagesCount).toEqual(0)
        expect(res.body.page).toEqual(1)
        expect(res.body.pageSize).toEqual(10)
        expect(res.body.totalCount).toEqual(0)

    })
    it('return comment for specified post ,notfound 404', async () => {


        const res = await req
            .get(SETTINGS.PATH.POSTS + '/' + 'gggggggggg' + '/comments')
            .expect(404)
    })

    it('created new comment 200', async () => {

        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        const posts = [...new Array(1)].map((_, index) => ({
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog.id,
            blogName: 'n1',
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }))
        const user = await createOneUser('test@mail.ru', 'test', '11111111')
        await blogsMongooseModel.create(datasetBlog)
        await postsMongooseModel.insertMany(posts)
        await usersMongooseModel.create(user)
        const postId = posts[0].id

        const loginUser = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test', password: '11111111'})
            .expect(200);


        const createComment = await req
            .post(SETTINGS.PATH.POSTS + '/' + postId + '/comments')
            .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
            .send({content: '22222222222222222222222222222222222'})
            .expect(201) // проверяем наличие эндпоинта

        console.log(createComment.body)

        expect(createComment.body.content).toEqual('22222222222222222222222222222222222')
        expect(createComment.body.commentatorInfo.userLogin).toEqual('test')
        expect(createComment.body.id).toEqual(expect.any(String))


    })
    it('created new comment , Unauthorized 401', async () => {

        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        const posts = [...new Array(1)].map((_, index) => ({
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog.id,
            blogName: 'n1',
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }))

        await blogsMongooseModel.create(datasetBlog)
        await postsMongooseModel.insertMany(posts)
        const postId = posts[0].id


        await req
            .post(SETTINGS.PATH.POSTS + '/' + postId + '/comments')
            .set('Authorization', `Bearer ggggggggg'`)
            .send({content: '22222222222222222222222222222222222'})
            .expect(401) // проверяем наличие эндпоинта
    })
    it('created new comment , inputModel has incorrect values 400 ', async () => {

        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        const posts = [...new Array(1)].map((_, index) => ({
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog.id,
            blogName: 'n1',
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }))
        const user = await createOneUser('test@mail.ru', 'test', '11111111')
        await blogsMongooseModel.create(datasetBlog)
        await postsMongooseModel.insertMany(posts)
        await usersMongooseModel.create(user)
        const postId = posts[0].id

        const loginUser = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test', password: '11111111'})
            .expect(200);


        await req
            .post(SETTINGS.PATH.POSTS + '/' + postId + '/comments')
            .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
            .send({content: '222'})
            .expect(400) // проверяем наличие эндпоинта


    })
    it('created new comment , not found post 404 ', async () => {

        const user = await createOneUser('test@mail.ru', 'test', '11111111')
        await usersMongooseModel.create(user)

        const loginUser = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test', password: '11111111'})
            .expect(200);


        await req
            .post(SETTINGS.PATH.POSTS + '/' + '33333333' + '/comments')
            .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
            .send({content: '222222222222222222222222'})
            .expect(404)

    })


    it('update post like status ,204', async () => {


        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        const datasetPost = {
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog.id,
            blogName: 'n1',
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }


        const smartBlogModel = new blogsMongooseModel(datasetBlog)
        await smartBlogModel.save()

        const smartPostModel = new postsMongooseModel(datasetPost);
        await smartPostModel.save();
        /*// @ts-ignore
        delete datasetPost._id*/

        const newUserCreated = await createOneUser('test@gmail.com', 'test', '123456789')

        await usersMongooseModel.create(newUserCreated)

        const loginUser = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test', password: '123456789'})
            .expect(200);


        await req
            .put(SETTINGS.PATH.POSTS + '/' + datasetPost.id + '/like-status')
            .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
            .send({likeStatus: 'Like'})
            .expect(204)

        const updatePost = await postsMongooseModel.find().lean()

        expect(updatePost[0].likesInfo.users.length).toEqual(1)
        expect(updatePost[0].likesInfo.likesCount).toEqual(1)
        expect(updatePost[0].likesInfo.dislikesCount).toEqual(0)
        expect(updatePost[0].likesInfo.users[0].likeStatus).toEqual('Like')
    })

    it('update post like status unauthorized ,401', async () => {

        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        const datasetPost = {
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog.id,
            blogName: 'n1',
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }


        const smartBlogModel = new blogsMongooseModel(datasetBlog)
        await smartBlogModel.save()

        const smartPostModel = new postsMongooseModel(datasetPost);
        await smartPostModel.save();


        await req
            .put(SETTINGS.PATH.POSTS + '/' + datasetPost.id + '/like-status')
            .set('Authorization', `Bearer 12345`)
            .send({likeStatus: 'Like'})
            .expect(401)


    })

    it('update post like status incorrect values ,400', async () => {

        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        const datasetPost = {
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog.id,
            blogName: 'n1',
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }


        const smartBlogModel = new blogsMongooseModel(datasetBlog)
        await smartBlogModel.save()

        const smartPostModel = new postsMongooseModel(datasetPost);
        await smartPostModel.save();
        /*// @ts-ignore
        delete datasetPost._id*/

        const newUserCreated = await createOneUser('test@gmail.com', 'test', '123456789')

        await usersMongooseModel.create(newUserCreated)

        const loginUser = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test', password: '123456789'})
            .expect(200)


        await req
            .put(SETTINGS.PATH.POSTS + '/' + datasetPost.id + '/like-status')
            .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
            .send({likeStatus: 'Lie'})
            .expect(400)

    })

    it('update post like status if comment with specified id doesnt exists ,404', async () => {

        const datasetBlog = {
            id: String(+(new Date())),
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://some.com',
            isMembership: false,
            createdAt: new Date().toISOString()
        }

        const datasetPost = {
            id: String(+(new Date())),
            title: 't1',
            content: 'c1',
            shortDescription: 's1',
            blogId: datasetBlog.id,
            blogName: 'n1',
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                users: []
            }
        }


        const smartBlogModel = new blogsMongooseModel(datasetBlog)
        await smartBlogModel.save()

        const smartPostModel = new postsMongooseModel(datasetPost);
        await smartPostModel.save();
        /*// @ts-ignore
        delete datasetPost._id*/

        const newUserCreated = await createOneUser('test@gmail.com', 'test', '123456789')

        await usersMongooseModel.create(newUserCreated)

        const loginUser = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test', password: '123456789'})
            .expect(200)


        await req
            .put(SETTINGS.PATH.COMMENTS + '/' + '5555555' + '/like-status')
            .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
            .send({likeStatus: 'Like'})
            .expect(404)

    })
})


