import {req} from "./test-helpers";
import {ADMIN_LOGIN, ADMIN_PASS, SETTINGS} from "../../src/settings";
import {MongoMemoryServer} from "mongodb-memory-server";
import {dbMongo, usersCollection} from "../../src/db/dbInMongo";
import {createUsers} from "./helpers/datasets";


describe('/users', () => {
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

    it('shouldn`t create user without authorization: STATUS 401', async () => {
        await req
            .post(SETTINGS.PATH.POSTS)
            .send({
                login: '',

            })
            .expect(401);
    });
    it('get all users', async () => {
        const res = await req
            .get(SETTINGS.PATH.USERS)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .expect(200) // проверяем наличие эндпоинта


        expect(res.body.items.length).toEqual(0) // проверяем ответ эндпоинта
        expect(res.body.pagesCount).toEqual(0) // проверяем ответ эндпоинта
        expect(res.body.page).toEqual(1) // проверяем ответ эндпоинта
        expect(res.body.pageSize).toEqual(10) // проверяем ответ эндпоинта
        expect(res.body.totalCount).toEqual(0) // проверяем ответ эндпоинта
    });
    it('should get post pagination', async () => {

        const usersArray = await createUsers(45)
        await usersCollection.insertMany(usersArray)


        const res = await req
            .get(SETTINGS.PATH.USERS + '?pageNumber=5&pageSize=5')
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .expect(200)


        expect(res.body.items.length).toEqual(5)
        expect(res.body.pagesCount).toEqual(9)
        expect(res.body.page).toEqual(5)
        expect(res.body.pageSize).toEqual(5)
        expect(res.body.totalCount).toEqual(45)

    })
    it('should create user with correct data by sa and return it: STATUS 201', async () => {


        const userData = {
            login: 'test',
            email: 'test@gmail.com',
            password: '123456789'
        }

        const newUser = await req
            .post(SETTINGS.PATH.USERS)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send({login: userData.login, email: userData.email, password: userData.password})
            .expect(201);

        expect(newUser.body).toEqual({
            id: expect.any(String),
            login: userData.login,
            email: userData.email,
            createdAt: expect.any(String),
        });
    });
    it('shouldn`t create user twice with correct data by sa: STATUS 400', async () => {

        const userData = {
            login: 'test',
            email: 'test@gmail.com',
            password: '123456789',
        }

        const newUser = await req
            .post(SETTINGS.PATH.USERS)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send({login: userData.login, email: userData.email, password: userData.password})
            .expect(201);

        await req
            .post(SETTINGS.PATH.USERS)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send({login: newUser.body.login, email: newUser.body.email, password: '123456789'})
            .expect(400);
    });
    it('shouldn`t create user with incorrect login: STATUS 400', async () => {

        const userData = {
            login: '',
            email: 'test@gmail.com',
            password: '123456789',
        }

        const newUser = await req
            .post(SETTINGS.PATH.USERS)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send(userData)
            .expect(400);
    });
    it('shouldn`t create user with incorrect email: STATUS 400', async () => {
        const userData = {
            login: 'test',
            email: 'test',
            password: '123456789',
        }

        const newUser = await req
            .post(SETTINGS.PATH.USERS)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send(userData)
            .expect(400);
    });
    it('shouldn`t create user with incorrect password: STATUS 400', async () => {
        const userData = {
            login: 'test',
            email: 'test@gmail.com',
            password: '1',
        }

        const newUser = await req
            .post(SETTINGS.PATH.USERS)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send(userData)
            .expect(400);
    });
    it('shouldn`t delete user by id without authorization: STATUS 401', async () => {
        const userData = {
            login: 'test',
            email: 'test@gmail.com',
            password: '123456789',
        }

        const newUser = await req
            .post(SETTINGS.PATH.USERS)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send(userData)
            .expect(201);

        await req.delete(SETTINGS.PATH.USERS + '/' + newUser.body.id).expect(401);
    });

    it('should delete user by id: STATUS 204', async () => {

        const userData = {
            login: 'test',
            email: 'test@gmail.com',
            password: '123456789',
        }

        const newUser = await req
            .post(SETTINGS.PATH.USERS)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send(userData)
            .expect(201);

        await req
            .delete(SETTINGS.PATH.USERS + '/' + newUser.body.id)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .expect(204);
    });

    it('shouldn`t delete user by id if specified user is not exists: STATUS 404', async () => {
        await req
            .delete(SETTINGS.PATH.USERS + '/555')
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .expect(404);
    });

})