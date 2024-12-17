import {MongoMemoryServer} from "mongodb-memory-server";
import {createOneUser} from "./helpers/datasets";
import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";
import mongoose from "mongoose";
import {deleteDB, usersMongooseModel} from "../../src/db/mongooseSchema/mongooseSchema";

describe('/auth-refresh', () => {
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

    it('Refresh token correct: STATUS 200', async () => {


        const newUserCreated = await createOneUser('test@gmail.com', 'test', '123456789')
        await usersMongooseModel.create(newUserCreated)

          const login =  await req
              .post(SETTINGS.PATH.AUTH + '/login')
              .send({loginOrEmail: 'test@gmail.com', password: '123456789'})
              .expect(200);
          const cookies = login.headers['set-cookie']
          const accessToken = login.body.accessToken


        const res = await req
            .post(SETTINGS.PATH.AUTH + '/refresh-token')
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Cookie', cookies)
            .expect(200);


        expect(res.body.accessToken).toEqual(expect.any(String))
        expect(res.body.accessToken).not.toBe(accessToken)
    });
    it('Refresh token not correct: STATUS 401', async () => {


        const res = await req
            .post(SETTINGS.PATH.AUTH + '/refresh-token')
            .set('Authorization', `Bearer ${'accessToken'}`)
            .set('Cookie', 'cookies')
            .expect(401);

    });

    it('logout: STATUS 204', async () => {


        const newUserCreated = await createOneUser('test@gmail.com', 'test', '123456789')
        await usersMongooseModel.create(newUserCreated)

        const login = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send({loginOrEmail: 'test@gmail.com', password: '123456789'})
            .expect(200);
        const cookies = login.headers['set-cookie']
        const accessToken = login.body.accessToken

        req
            .post(SETTINGS.PATH.AUTH + '/logout')
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Cookie', cookies)
            .expect(204)
    });
    it('logout: STATUS 401', async () => {
        await req
            .post(SETTINGS.PATH.AUTH + '/logout')
            .set('Authorization', `Bearer '1111111'`)
            .set('Cookie', 'cookies')
            .expect(401)
    });

})