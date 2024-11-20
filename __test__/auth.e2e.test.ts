import {req} from "./test-helpers";
import {ADMIN_LOGIN, ADMIN_PASS, SETTINGS} from "../src/settings";
import {MongoMemoryServer} from "mongodb-memory-server";
import {dbMongo, usersCollection} from "../src/db/dbInMongo";
import {createOneUser, createUsers} from "./helpers/datasets";
import {log} from "util";
import {ObjectId} from "mongodb";


describe('/auth', () => {
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


    it('If Login and Password are correct: STATUS 200', async () => {


        const newUserCreated = await createOneUser('test@gmail.com', 'test', '123456789')

        await usersCollection.insertOne(newUserCreated)

        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test', password: '123456789'})
            .expect(200);

        const res = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test@gmail.com', password: '123456789'})
            .expect(200);

        expect(res.body.accessToken).toEqual(expect.any(String))
    });
    it('get information about current user ', async () => {
        const newUserCreated = await createOneUser('test@gmail.com', 'test', '123456789')

        await usersCollection.insertOne(newUserCreated)

        const loginUser = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test', password: '123456789'})
            .expect(200);


        const res = await req
            .get(SETTINGS.PATH.AUTH + '/me')
            .set('Authorization', `Bearer ${loginUser.body.accessToken}`)
            .expect(200) // проверяем наличие эндпоинта


        expect(res.body.email).toEqual('test@gmail.com')
        expect(res.body.login).toEqual('test')
        expect(res.body.userId).toEqual(expect.any(String))

    });
    it('If the inputModel has incorrect values: STATUS 400', async () => {


        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'tes11111', password: '123456789123456789123456789123456789123456789'})
            .expect(400);


    })
    it('If the password or login is wrong: STATUS 401', async () => {

        const newUserCreated = await createOneUser('test@gmail.com', 'test', '123456789')

        await usersCollection.insertOne(newUserCreated)

        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test@gmail.com', password: '123456789000000000'})
            .expect(401);


    })
})