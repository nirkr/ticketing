import request from "supertest";
import mongoose from 'mongoose';
import {app} from '../../app';
import {Ticket} from "../../models/Ticket";

describe('show orders tests', () => {
    it('returns 404 if the specific order is not found', async ()=>{
        const mongoOrderId = mongoose.Types.ObjectId();
        await request(app)
            .get(`/api/orders/${mongoOrderId}`)
            .set('Cookie', global.getCookie())
            .send({})
            .expect(404);
    });

    it('returns 200 if the order was found',async ()=>{
        const title = 'concert';
        const price = 20;

        //build ticket
        const ticket = Ticket.build({
            title,
            price,
        })
        await ticket.save();
        // create order with the built order
        const cookie = global.getCookie();
        const newOrder = await request(app)
            .post('/api/orders')
            .set("Cookie", cookie)
            .send({
                ticketId: ticket.id
            })
            .expect(201);
        // make request to fetch the order

        const orderResponse = await request(app)
            .get(`/api/orders/${newOrder.body.id}`)
            .set("Cookie", cookie)
            .send().expect(200);
        expect(orderResponse.body).toEqual(newOrder.body)
    })
});
