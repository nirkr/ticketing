import request from "supertest";
import {app} from '../../app';
import mongoose from 'mongoose';

describe('show tickets tests', () => {
    it('returns 404 if the specific ticket is not found', async ()=>{
        const mongoTicketId = mongoose.Types.ObjectId();
        await request(app)
            .get(`/api/tickets/${mongoTicketId}`)
            // .get(`/api/tickets/aaaa`)
            .send({})
            .expect(404);
    });

    it('returns 200 if the ticket was found',async ()=>{
        const title = 'concert';
        const price = 20;

        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', global.getCookie())
            .send({
                title, price
            })
            .expect(201)
        const ticketResponse = await request(app)
            .get(`/api/tickets/${response.body.id}`)
            .send().expect(200)
        expect(ticketResponse.body.title).toBe(title)
    })
});
