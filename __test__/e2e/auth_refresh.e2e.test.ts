import {MongoMemoryServer} from "mongodb-memory-server";
import {dbMongo, deviceCollection, usersCollection} from "../../src/db/dbInMongo";
import {createOneUser, creatTokenTest} from "./helpers/datasets";
import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";
import {devicesService} from "../../src/domain/devices-service";
import {devicesRepository} from "../../src/repositories/devices-repository";
import {ObjectId} from "mongodb";

describe('/auth-refresh', () => {
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

    it('Refresh token correct: STATUS 200', async () => {


        const newUserCreated = await createOneUser('test@gmail.com', 'test', '123456789')
        await usersCollection.insertOne(newUserCreated)

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
        await usersCollection.insertOne(newUserCreated)

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