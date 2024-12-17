import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";
import {createComment} from "./helpers/datasets";
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {
    blogsMongooseModel, commentsMongooseModel, limitsMongooseModel,
    postsMongooseModel,
    usersMongooseModel
} from "../../src/db/mongooseSchema/mongooseSchema";



describe('/comments', () => {

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        //await dbMongo.run(mongoServer.getUri());
        await mongoose.connect(mongoServer.getUri())
    })

    beforeEach(async () => {
        await blogsMongooseModel.deleteMany()
        await postsMongooseModel.deleteMany()
        await usersMongooseModel.deleteMany()
        await commentsMongooseModel.deleteMany()
        await limitsMongooseModel.deleteMany()
    })

    afterAll(async () => {
        //done()
        await mongoose.connection.close()
    })


    it('find comment by Id , 200', async () => {

        const createData = {
            content: '2222222222222222222222',
            emailUser: 'test@mail.ru',
            loginUser: 'test',
            passwordUser: '1234567'
        }

        const creteCommentData = await createComment(createData)


        const res = await req
            .get(SETTINGS.PATH.COMMENTS + '/' + creteCommentData.commentId)
            .expect(200)


        expect(res.body.content).toEqual('2222222222222222222222')

    })
    it('not found comment by id , 404', async () => {


        const res = await req
            .get(SETTINGS.PATH.COMMENTS + '/' + '22222')
            .expect(404)
    })
    it('delete comment, OK 204', async () => {

        const createData = {
            content: '2222222222222222222222',
            emailUser: 'test@mail.ru',
            loginUser: 'test',
            passwordUser: '1234567890'
        }

        const creteCommentData = await createComment(createData)

        const loginUser = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: creteCommentData.userLogin, password: creteCommentData.userPassword})
            .expect(200);
        console.log(loginUser.body)

        const allCommentsOne = await commentsMongooseModel.find().lean()
        await req
            .delete(SETTINGS.PATH.COMMENTS + '/' + creteCommentData.commentId)
            .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
            .expect(204)

        const allCommentsDel = await commentsMongooseModel.find().lean()

        expect(allCommentsOne.length).toEqual(1)
        expect(allCommentsDel.length).toEqual(0)

    })
        it('delete comment, Unauthorized 401', async () => {

            const createData = {
                content: '2222222222222222222222',
                emailUser: 'test@mail.ru',
                loginUser: 'test',
                passwordUser: '1234567'
            }

            const creteCommentData = await createComment(createData)


            const deleteComment = await req
                .delete(SETTINGS.PATH.COMMENTS + '/' + creteCommentData.commentId)
                .set('Authorization', `Bearer 5555555`)
                .expect(401)
        })
    it('delete comment, if try delete the comment that is not your own 403', async () => {

        const createData1 = {
            content: '2222222222222222222222',
            emailUser: 'test@mail.ru',
            loginUser: 'test',
            passwordUser: '1234567'
        }
        const createData2 = {
            content: '2222222222222222222222',
            emailUser: 'test@mail.ru',
            loginUser: 'test1',
            passwordUser: '1234567'
        }

        const creteCommentData1 = await createComment(createData1)
        const creteCommentData2 = await createComment(createData2)


        const loginUser = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: creteCommentData1.userLogin, password: creteCommentData1.userPassword})
            .expect(200);


        await req
            .delete(SETTINGS.PATH.COMMENTS + '/' + creteCommentData2.commentId)
            .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
            .expect(403)
    })
    it('delete comment, not found 404', async () => {

        const createData1 = {
            content: '2222222222222222222222',
            emailUser: 'test@mail.ru',
            loginUser: 'test',
            passwordUser: '1234567'
        }


        const creteCommentData1 = await createComment(createData1)


        const loginUser = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: creteCommentData1.userLogin, password: creteCommentData1.userPassword})
            .expect(200);


        await req
            .delete(SETTINGS.PATH.COMMENTS + '/' + '444444')
            .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
            .expect(404)
    })
        it('update comment , no content 204', async () => {

            const createData = {
                content: '2222222222222222222222',
                emailUser: 'test@mail.ru',
                loginUser: 'test',
                passwordUser: '1234567'
            }


            const creteCommentData = await createComment(createData)


            const loginUser = await req
                .post(SETTINGS.PATH.AUTH + '/login')
                .send({loginOrEmail: creteCommentData.userLogin, password: creteCommentData.userPassword})
                .expect(200);


            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + creteCommentData.commentId)
                .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
                .send({content: '5555555555555552222222222'})
                .expect(204)

            const updateComment = await commentsMongooseModel.find().lean()
            expect(updateComment[0].content).toEqual('5555555555555552222222222')

        })
        it('update comment ,if the inputModel has incorrect values 400', async () => {

            const createData = {
                content: '2222222222222222222222',
                emailUser: 'test@mail.ru',
                loginUser: 'test',
                passwordUser: '1234567'
            }


            const creteCommentData = await createComment(createData)

            const loginUser = await req
                .post(SETTINGS.PATH.AUTH + '/login')
                .send({loginOrEmail: creteCommentData.userLogin, password: creteCommentData.userPassword})
                .expect(200);


            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + creteCommentData.commentId)
                .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
                .send({content: '555555555555555'})
                .expect(400)
        })
        it('update comment ,unauthorized 401', async () => {

            const createData = {
                content: '2222222222222222222222',
                emailUser: 'test@mail.ru',
                loginUser: 'test',
                passwordUser: '1234567'
            }


            const creteCommentData = await createComment(createData)


            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + creteCommentData.commentId)
                .set('Authorization', `Bearer lkkkk`)
                .send({content: '5555555555555556666666666666666'})
                .expect(401)
        })
        it('update comment ,if try edit the comment that is not you own 403', async () => {

            const createData1 = {
                content: '2222222222222222222222',
                emailUser: 'test1@mail.ru',
                loginUser: 'test1',
                passwordUser: '1234567'
            }

            const createData2 = {
                content: '2222222222222222222222',
                emailUser: 'test2@mail.ru',
                loginUser: 'test2',
                passwordUser: '1234567'
            }

            const creteCommentData1 = await createComment(createData1)
            const creteCommentData2 = await createComment(createData2)

            const loginUser1 = await req
                .post(SETTINGS.PATH.AUTH + '/login')
                .send({loginOrEmail: creteCommentData1.userLogin, password: creteCommentData1.userPassword})
                .expect(200);

            const loginUser2 = await req
                .post(SETTINGS.PATH.AUTH + '/login')
                .send({loginOrEmail: creteCommentData2.userLogin, password: creteCommentData2.userPassword})
                .expect(200);


            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + creteCommentData1.commentId)
                .set('Authorization', `Bearer ${loginUser2.body.accessToken}`)
                .send({content: '55555555555555511111111111111111111111111111'})
                .expect(403)
        })
        it('update comment ,not found 404', async () => {

            const createData = {
                content: '2222222222222222222222',
                emailUser: 'test@mail.ru',
                loginUser: 'test',
                passwordUser: '1234567'
            }


            const creteCommentData = await createComment(createData)

            const loginUser = await req
                .post(SETTINGS.PATH.AUTH + '/login')
                .send({loginOrEmail: creteCommentData.userLogin, password: creteCommentData.userPassword})
                .expect(200);


            await req
                .put(SETTINGS.PATH.COMMENTS + '/1234')
                .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
                .send({content: '5555555555555556666666666666666'})
                .expect(404)
        })


})


