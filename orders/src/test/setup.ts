import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'asdfaa';
    process.env.EXPIRATION_WINDOW_SECONDS = '100';
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    jest.clearAllMocks();
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

declare global {
    // namespace NodeJS {
    //     interface Global {
    //         getCookie:()=> string[];
    //     }
    // }
    var getCookie: () => string
}

global.getCookie = () => {
    const mongoId = new mongoose.Types.ObjectId().toHexString();
    const jwtData = jwt.sign({
        email: 'test@test.com',
        id: mongoId
    }, process.env.JWT_KEY!)
    const session = { jwt: jwtData };
    const sessionJson = JSON.stringify(session);
    const base64 = Buffer.from(sessionJson).toString('base64');
    return(`express:sess=${base64}`);
}