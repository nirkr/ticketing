import request from 'supertest';
import { app } from '../../app';
// import {DatabaseConnectionError} from '../../errors/database-connection-error'

describe('signIn test suite', ()=>{
    const credentials = {
        email: 'test@test.com',
        password: 'abcfd'
    };

    it('should get 200 with successful signin', async () => {
        await request(app)
            .post('/api/user/signup')
            .send(credentials)
            .expect(201);
        await request(app)
            .post('/api/user/signin')
            .send(credentials)
            .expect(200);
    });

    it('should block user from signin, if he did not signup', async ()=> {
        // const data = new DatabaseConnectionError();
        await request(app)
            .post('/api/user/signin')
            .send(credentials)
            .expect(400,
                {
                "errors": [
                    {
                        "message": "Invalid credentials"
                    }
                ]
            }
            //     { errors: data.serializeErrors() }
            )
    });

    it('should fail filling up wrong password', async () => {
        await request(app)
            .post('/api/user/signup')
            .send(credentials)
            .expect(201);
        await request(app)
            .post('/api/user/signin')
            .send({
                email: 'test@test.com',
                password: '1245'
            })
            .expect(400);
    });

    it('should have a response with Set-Cookie in the header', async () => {
        await request(app)
            .post('/api/user/signup')
            .send(credentials)
        const response = await request(app)
            .post('/api/user/signin')
            .send(credentials)
            .expect(200)
        expect(response.get('Set-Cookie')).toBeDefined();
    });
})