import {req} from "./test-helpers";
import {ADMIN_LOGIN, ADMIN_PASS, SETTINGS} from "../src/settings";
import {MongoMemoryServer} from "mongodb-memory-server";
import {dbMongo, usersCollection} from "../src/db/dbInMongo";
import {createOneUser, createUsers} from "./helpers/datasets";


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


    it('If Login and Password are correct: STATUS 204', async () => {


        const newUserCreated = await createOneUser('test@gmail.com', 'test', '123456789')

        await usersCollection.insertOne(newUserCreated)

        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test', password: '123456789'})
            .expect(204);

        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test@gmail.com', password: '123456789'})
            .expect(204);

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