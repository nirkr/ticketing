import request from 'supertest' // allows to fake a request to express application
import {app} from '../../app';

describe('signUp test suite', () => {
    it('should return 201 on successful signup', async () => {
        return request(app)
            .post('/api/user/signup')
            .send({
                email: 'te23st@test.com',
                password: 'asdfgg'
            })
            .expect(201);
    });

    it('should return 400 for non-valid email', async () => {
        return request(app)
            .post('/api/user/signup')
            .send({
                email: 'tetest.com',
                password: 'asdfgg'
            })
            .expect(400);
    });

    it('should return 400 with missing email and password', async () => {
        await request(app)
            .post('/api/user/signup')
            .send({})
            .expect(400);
    });

    it('should not allow to dulplicate user', async () => {
        await request(app)
            .post('/api/user/signup')
            .send({
                email: 'test@test.com',
                password: 'asdfgg'
            })
            .expect(201);
        await request(app)
            .post('/api/user/signup')
            .send({
                email: 'test@test.com',
                password: 'asdfgg'
            })
            .expect(400);
    });

    // app.ts configures cookieSession with secure: true (https request).
    // Supertest doesn't use that. It performs regular HTTP request.
    it('should have response with set-cookie header - sets cookie',async () => {
        const response = await request(app)
            .post('/api/user/signup')
            .send({
                email: 'test@test.com',
                password: 'asdfgg'
            })
            .expect(201);

        
        expect(response.get('Set-Cookie')).toBeDefined();
    });
});

