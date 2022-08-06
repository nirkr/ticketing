import request from "supertest";
import {app} from '../../app';

const createTicket = () =>
    request(app)
        .post('/api/tickets')
        .set('Cookie', global.getCookie())
        .send({
            title: 'nir',
            price: 20
        })
        .expect(201)


describe('index tests', ()=>{
    it('get all tickets',async()=>{
        for(let i=0; i<3; i++){
            await createTicket();
        }
        const data = await request(app)
            .get('/api/tickets')
            .send()
            .expect(200)

        expect(data.body.length).toBe(3)
    })
})