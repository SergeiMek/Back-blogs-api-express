import {MongoMemoryServer} from "mongodb-memory-server";
import {createOneUser, loginUser} from "./helpers/datasets";
import {usersDBType} from "../../src/db/dbType";
import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";
import mongoose from "mongoose";
import {deleteDB, devicesMongooseModel, usersMongooseModel} from "../../src/db/mongooseSchema/mongooseSchema";


describe('/devise', () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        //await dbMongo.run(mongoServer.getUri());
        await mongoose.connect(mongoServer.getUri())
    })

    beforeEach(async () => {
        await deleteDB()
    })

    afterAll(async () => {
        //done()
        await mongoose.connection.close()
    })

    it('devise test', async () => {

        const user: usersDBType = await createOneUser('test@gmail.com', 'test', '123456789')
        await usersMongooseModel.create(user)
        const tokens = []
        const userAgents = ['google1', 'google2', 'google3', 'google4'];

        for (let i = 0; i < userAgents.length; i++) {
            const response = await req
                .post(SETTINGS.PATH.AUTH + '/login')
                .send({loginOrEmail: 'test', password: '123456789'})
                .set('User-Agent', userAgents[i])
                .set('X-Forwarded-For', i.toString())
                .expect(200);

            const cookies = response.headers['set-cookie'];
            tokens.push(cookies[0])

        }
        const devise1 = await devicesMongooseModel.find().lean()


        await new Promise(resolve => setTimeout(resolve, 1000));
        const refreshToken1 = await req
            .post(SETTINGS.PATH.AUTH + '/refresh-token')
            .set('Cookie', tokens[0])
            .expect(200);

        const devise2 = await devicesMongooseModel.find().lean()


        expect(devise1.length).toEqual(4)
        expect(devise2.length).toEqual(4)
        expect(devise1[0].lastActiveDate).not.toBe(devise2[0].lastActiveDate)
        expect(devise1[1]).toEqual(devise2[1])
        expect(devise1[2]).toEqual(devise2[2])
        expect(devise1[3]).toEqual(devise2[3])

    })
    it('devise test get, ok', async () => {

        const user: usersDBType = await createOneUser('test@gmail.com', 'test', '123456789')
        await usersMongooseModel.create(user)
        const tokens = []
        const userAgents = ['google1', 'google2'];

        for (let i = 0; i < userAgents.length; i++) {
            const response = await req
                .post(SETTINGS.PATH.AUTH + '/login')
                .send({loginOrEmail: 'test', password: '123456789'})
                .set('User-Agent', userAgents[i])
                .set('X-Forwarded-For', i.toString())
                .expect(200);

            const cookies = response.headers['set-cookie'];
            tokens.push(cookies[0])

        }

        const getDevises = await req
            .get(SETTINGS.PATH.SECURITY + '/devices')
            .set('Cookie', tokens[0])
            .expect(200)


        expect(getDevises.body.length).toEqual(2)
        expect(getDevises.body[0].title).toEqual(userAgents[0])
        expect(getDevises.body[1].title).toEqual(userAgents[1])
    })
    it('devise test get, 401', async () => {

        const getDevises = await req
            .get(SETTINGS.PATH.SECURITY + '/devices')
            .set('Cookie', '')
            .expect(401)
    })
    it('devise test delete all users other current devices sessions,204', async () => {

        const user: usersDBType = await createOneUser('test@gmail.com', 'test', '123456789')
        await usersMongooseModel.create(user)
        const tokens = []
        const userAgents = ['google1', 'google2', 'google3', 'google4'];

        for (let i = 0; i < userAgents.length; i++) {
            const response = await req
                .post(SETTINGS.PATH.AUTH + '/login')
                .send({loginOrEmail: 'test', password: '123456789'})
                .set('User-Agent', userAgents[i])
                .set('X-Forwarded-For', i.toString())
                .expect(200);

            const cookies = response.headers['set-cookie'];
            tokens.push(cookies[0])

        }
        const devise1 = await devicesMongooseModel.find().lean()


        const deleteUsers = await req
            .delete(SETTINGS.PATH.SECURITY + '/devices')
            .set('Cookie', tokens[0])
            .expect(204);

        const devise2 = await devicesMongooseModel.find().lean()


        expect(devise1.length).toEqual(4)
        expect(devise2.length).toEqual(1)
        expect(devise2[0].title).toEqual(userAgents[0])
    })
    it('devise test delete all users other current devices sessions,401', async () => {

        const deleteUsers = await req
            .delete(SETTINGS.PATH.SECURITY + '/devices')
            .set('Cookie', '')
            .expect(401);

    })
    it('devise test delete user by id,204', async () => {

        const user: usersDBType = await createOneUser('test@gmail.com', 'test', '123456789')
        await usersMongooseModel.create(user)
        const tokens = []
        const userAgents = ['google1', 'google2'];

        for (let i = 0; i < userAgents.length; i++) {
            const response = await req
                .post(SETTINGS.PATH.AUTH + '/login')
                .send({loginOrEmail: 'test', password: '123456789'})
                .set('User-Agent', userAgents[i])
                .set('X-Forwarded-For', i.toString())
                .expect(200);

            const cookies = response.headers['set-cookie'];
            tokens.push(cookies[0])

        }
        const devise1 = await devicesMongooseModel.find().lean()
        const deviseId = devise1[0].deviceId

        const deleteUsers = await req
            .delete(SETTINGS.PATH.SECURITY + '/devices/' + deviseId)
            .set('Cookie', tokens[0])
            .expect(204);

        const devise2 = await devicesMongooseModel.find().lean()


        expect(devise1.length).toEqual(2)
        expect(devise2.length).toEqual(1)
        expect(devise2[0].title).toEqual(userAgents[1])
    })
    it('devise test delete user by id,401', async () => {

        const user: usersDBType = await createOneUser('test@gmail.com', 'test', '123456789')
        await usersMongooseModel.create(user)
        const tokens = []
        const userAgents = ['google1', 'google2'];

        for (let i = 0; i < userAgents.length; i++) {
            const response = await req
                .post(SETTINGS.PATH.AUTH + '/login')
                .send({loginOrEmail: 'test', password: '123456789'})
                .set('User-Agent', userAgents[i])
                .set('X-Forwarded-For', i.toString())
                .expect(200);

            const cookies = response.headers['set-cookie'];
            tokens.push(cookies[0])

        }
        const devise1 = await devicesMongooseModel.find().lean()
        const deviseId = devise1[0].deviceId

        const deleteUsers = await req
            .delete(SETTINGS.PATH.SECURITY + '/devices/' + deviseId)
            .set('Cookie', '')
            .expect(401);
    })
    it('devise test if try to delete the deviceId of other user,403', async () => {

        const user1: usersDBType = await createOneUser('test1@gmail.com', 'test1', '123456789')
        const user2: usersDBType = await createOneUser('test2@gmail.com', 'test2', '123456789')
        await usersMongooseModel.insertMany([user1, user2])
        const tokens = []
        const userAgents = ['google1', 'google2'];

        const response1 = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test1', password: '123456789'})
            .set('User-Agent', userAgents[0])
            .set('X-Forwarded-For', '0')
            .expect(200);

        const response2 = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test2', password: '123456789'})
            .set('User-Agent', userAgents[1])
            .set('X-Forwarded-For', '1')
            .expect(200);

        const cookies1 = response1.headers['set-cookie']
        const cookies2 = response2.headers['set-cookie']


        const devise1 = await devicesMongooseModel.find().lean()


        const deviseId = devise1[0].deviceId

        const deleteUsers = await req
            .delete(SETTINGS.PATH.SECURITY + '/devices/' + deviseId)
            .set('Cookie', cookies2)
            .expect(403);

        const devise2 = await devicesMongooseModel.find().lean()


        expect(devise1.length).toEqual(2)
        expect(devise2.length).toEqual(2)
    })
    it('devise test no found device by id ,403', async () => {

        const user: usersDBType = await createOneUser('test1@gmail.com', 'test1', '123456789')

        await usersMongooseModel.create(user)
        const tokens = []


        const response = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test1', password: '123456789'})
            .set('User-Agent', 'google')
            .set('X-Forwarded-For', '0')
            .expect(200);


        const cookies1 = response.headers['set-cookie']


        const devise1 = await devicesMongooseModel.find().lean()


        const deleteUsers = await req
            .delete(SETTINGS.PATH.SECURITY + '/devices/' + '44444')
            .set('Cookie', cookies1)
            .expect(404);

        const devise2 = await devicesMongooseModel.find().lean()

        expect(devise1).toEqual(devise2)
    })
    it('logout test ,204', async () => {

        const user: usersDBType = await createOneUser('test@gmail.com', 'test', '123456789')
        await usersMongooseModel.create(user)
        const tokens = []
        const userAgents = ['google1', 'google2', 'google3', 'google4'];

        for (let i = 0; i < userAgents.length; i++) {
            const response = await req
                .post(SETTINGS.PATH.AUTH + '/login')
                .send({loginOrEmail: 'test', password: '123456789'})
                .set('User-Agent', userAgents[i])
                .set('X-Forwarded-For', i.toString())
                .expect(200);

            const cookies = response.headers['set-cookie'];
            tokens.push(cookies[0])

        }
        const devise1 = await devicesMongooseModel.find().lean()

        const logoutUsers = await req
            .post(SETTINGS.PATH.AUTH + '/logout')
            .set('Cookie', tokens[2])
            .expect(204);

        const devise2 = await devicesMongooseModel.find().lean()


        expect(devise1.length).toEqual(4)
        expect(devise2.length).toEqual(3)
        expect(devise2[0].title).toEqual(userAgents[0])
        expect(devise2[1].title).toEqual(userAgents[1])
        expect(devise2[2].title).toEqual(userAgents[3])

    })

    it('More than 5 attempts from one IP-address during 10 seconds,423', async () => {

        const user1: usersDBType = await createOneUser('test@gmail.com', 'test', '123456789')
        await usersMongooseModel.create(user1)

        const userAgents = ['google1', 'google2','google3','google2','google2'];

        for (let i = 0; i < userAgents.length; i++) {
            const response = await req
                .post(SETTINGS.PATH.AUTH + '/login')
                .send({loginOrEmail: 'test', password: '123456789'})
                .set('User-Agent', userAgents[i])
                .set('X-Forwarded-For', i.toString())
                .expect(200);
        }
        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test', password: '123456789'})
            .set('User-Agent', 'google2')
            .set('X-Forwarded-For', 'google2')
            .expect(429);

    })


})