import request from 'supertest';
import { app } from '../../app';

describe('currentUser api tests', ()=> {

    it('responds with details about the current user', async () => {
        // const authResponse = await request(app)
        //     .post('/api/user/signup')
        //     .send({
        //         email: 'test@test.com',
        //         password: 'password'
        //     })
        //     .expect(201)
        // const cookie = authResponse.get('Set-Cookie');

        const cookie = await global.getCookie();

        const response = await request(app)
            .get('/api/user/currentUser')
            .set('Cookie',cookie)
            .send()
            .expect(200);
        expect(response.body.currentUser.email).toEqual('test@test.com');
    });

    it('should return null if user is authenticated', async () => {
        const response = await request(app)
            .get('/api/user/currentUser')
            .send()
            .expect(401);
        // expect(response.body.currentUser).toEqual(null);
    });
})
