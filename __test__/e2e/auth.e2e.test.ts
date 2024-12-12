import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";
import {MongoMemoryServer} from "mongodb-memory-server";
import {dbMongo, usersCollection} from "../../src/db/dbInMongo";
import {createOneUser, createOneUserRegistration} from "./helpers/datasets";
import {emailAdapter} from "../../src/adapters/email-adapter";



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

    emailAdapter.sendEmail = jest.fn().mockImplementation((email: string, subject: string, message: string) => Promise.resolve())


    it('If Login and Password are correct: STATUS 200', async () => {


        const newUserCreated = await createOneUser('test@gmail.com', 'test', '123456789')

        await usersCollection.insertOne(newUserCreated)

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
    it('should register user with correct data', async () => {


        const result = await req
            .post(SETTINGS.PATH.AUTH + '/registration')
            .send({login: 'test', password: '123456789', email: 'test@mail.ru'})
            .expect(204)


        expect(emailAdapter.sendEmail).toBeCalled()
        expect(emailAdapter.sendEmail).toBeCalledTimes(1)

    })
    it('should not register user twice', async () => {

        const userLoginData = {
            login: 'test',
            password: '123456789',
            email: 'test@mail.ru'
        }

        const createdUser = await createOneUser(userLoginData.email, userLoginData.login, userLoginData.password)
        await usersCollection.insertOne(createdUser)

        const res = await req
            .post(SETTINGS.PATH.AUTH + '/registration')
            .send(userLoginData)
            .expect(400)



        expect(res.body.errorsMessages[0].field).toEqual('email')
        expect(res.body.errorsMessages[0].message).toEqual(expect.any(String))


    })
    it('incorrect login', async () => {

        const userLoginData = {
            login: '',
            password: '123456789',
            email: 'test@mail.ru'
        }

        const res = await req
            .post(SETTINGS.PATH.AUTH + '/registration')
            .send(userLoginData)
            .expect(400)



        expect(res.body.errorsMessages[0].field).toEqual('login')
        expect(res.body.errorsMessages[0].message).toEqual(expect.any(String))


    })
    it('incorrect password', async () => {

        const userLoginData = {
            login: 'test',
            password: '',
            email: 'test@mail.ru'
        }

        const res = await req
            .post(SETTINGS.PATH.AUTH + '/registration')
            .send(userLoginData)
            .expect(400)



        expect(res.body.errorsMessages[0].field).toEqual('password')
        expect(res.body.errorsMessages[0].message).toEqual(expect.any(String))

    })
    it('email was verified. Account was activated', async () => {

        const userLoginData = {
            login: 'test',
            password: '123456789',
            email: 'test@mail.ru',
            confirmationCode: 'code',
            isConfirmed:false
        }

        const createdUser = await createOneUserRegistration(userLoginData)
        await usersCollection.insertOne(createdUser)



        const res = await req
            .post(SETTINGS.PATH.AUTH + '/registration-confirmation')
            .send({code:'code'})
            .expect(204)


    })
    it('code confirmed ', async () => {

        const userLoginData = {
            login: 'test',
            password: '123456789',
            email: 'test@mail.ru',
            confirmationCode: 'code',
            isConfirmed:true
        }

        const createdUser = await createOneUserRegistration(userLoginData)
        await usersCollection.insertOne(createdUser)



        const res = await req
            .post(SETTINGS.PATH.AUTH + '/registration-confirmation')
            .send({code:'code'})
            .expect(400)

        expect(res.body.errorsMessages[0].field).toEqual('code')
        expect(res.body.errorsMessages[0].message).toEqual(expect.any(String))


    })
    it('not found user by code ', async () => {

        const userLoginData = {
            login: 'test',
            password: '123456789',
            email: 'test@mail.ru',
            confirmationCode: 'code',
            isConfirmed:true
        }

        const createdUser = await createOneUserRegistration(userLoginData)
        await usersCollection.insertOne(createdUser)



        const res = await req
            .post(SETTINGS.PATH.AUTH + '/registration-confirmation')
            .send({code:''})
            .expect(400)

        expect(res.body.errorsMessages[0].field).toEqual('code')
        expect(res.body.errorsMessages[0].message).toEqual(expect.any(String))


    })
    it('email resending', async () => {

        const userLoginData = {
            login: 'test',
            password: '123456789',
            email: 'test@mail.ru',
            confirmationCode: 'code',
            isConfirmed:false
        }

        const createdUser = await createOneUserRegistration(userLoginData)
        await usersCollection.insertOne(createdUser)



        const res = await req
            .post(SETTINGS.PATH.AUTH + '/registration-email-resending')
            .send({email:'test@mail.ru'})
            .expect(204)

        expect(emailAdapter.sendEmail).toBeCalled()
        expect(emailAdapter.sendEmail).toBeCalledTimes(2)


    })
    it('not correct email', async () => {

        const userLoginData = {
            login: 'test',
            password: '123456789',
            email: 'test@mail.ru',
            confirmationCode: 'code',
            isConfirmed:false
        }

        const createdUser = await createOneUserRegistration(userLoginData)
        await usersCollection.insertOne(createdUser)



        const res = await req
            .post(SETTINGS.PATH.AUTH + '/registration-email-resending')
            .send({email:''})
            .expect(400)


        expect(res.body.errorsMessages[0].field).toEqual('email')
        expect(res.body.errorsMessages[0].message).toEqual(expect.any(String))
    })
    it('the code has already been verified', async () => {

        const userLoginData = {
            login: 'test',
            password: '123456789',
            email: 'test@mail.ru',
            confirmationCode: 'code',
            isConfirmed:true
        }

        const createdUser = await createOneUserRegistration(userLoginData)
        await usersCollection.insertOne(createdUser)



        const res = await req
            .post(SETTINGS.PATH.AUTH + '/registration-email-resending')
            .send({email:'test@mail.ru'})
            .expect(400)


        expect(res.body.errorsMessages[0].field).toEqual('email')
        expect(res.body.errorsMessages[0].message).toEqual(expect.any(String))
    })
})