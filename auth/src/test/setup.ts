    import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {app} from '../app'
import request from "supertest";

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'asdfaa';
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

// ------ Setting up global getCookie function as global function
// ==> instead of implementing these getCookies in the separate tests

declare global{
    namespace NodeJS{
        interface Global{
            getCookie(): Promise<string[]>
        }
    }
}

global.getCookie = async () => {
    const credentials = {
        email: 'test@test.com',
        password: 'password'
    };
    const response = await request(app)
        .post('/api/user/signup')
        .send(credentials)
        .expect(201);
    console.log(response.get('Set-Cookie'));
    return response.get('Set-Cookie');
}