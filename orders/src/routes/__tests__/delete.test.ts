import request from "supertest";
import mongoose from "mongoose";
import {app} from '../../app';
import {Ticket} from "../../models/Ticket";
import {OrderStatus} from "../../models/Order";
import {natsWrapper} from '../../nats-wrapper'

describe('delete tests',  ()=> {
    const buildTicket = () =>{
        const title = 'concert';
        const price = 20;
        return Ticket.build({
            id: mongoose.Types.ObjectId().toHexString(),
            title,
            price,
        })
    }

    it('should return 404 if order does not exist', async () => {
        const randomOrderId = mongoose.Types.ObjectId();
        await request(app)
            .get(`/api/orders/${randomOrderId}`)
            .set('Cookie', global.getCookie())
            .expect(404);
    });
    it('should have be the user created order, if not return 401',async ()=>{
        //build ticket
        const ticket = buildTicket();
        await ticket.save();
        // create order with the built order
        const newOrder = await request(app)
            .post('/api/orders')
            .set("Cookie", global.getCookie())
            .send({
                ticketId: ticket.id
            })
            .expect(201);
        await request(app)
            .get(`/api/orders/${newOrder.body.id}`)
            .set('Cookie', global.getCookie())
            .expect(401);
    })
    it('should update the order to cancel status, return 200',async ()=>{
        const ticket = buildTicket();
        await ticket.save();
        const cookie = global.getCookie();
        const newOrder = await request(app)
            .post('/api/orders')
            .set("Cookie", cookie)
            .send({
                ticketId: ticket.id
            })
            .expect(201);
        const response = await request(app)
            .delete(`/api/orders/${newOrder.body.id}`)
            .set('Cookie', cookie)
            .expect(200);
        expect(response.body.status).toEqual(OrderStatus.Cancelled);
    })
    it('should emit cancel event',async ()=>{
        const ticket = buildTicket();
        await ticket.save();
        const cookie = global.getCookie();
        const newOrder = await request(app)
            .post('/api/orders')
            .set("Cookie", cookie)
            .send({
                ticketId: ticket.id
            })
            .expect(201);
        const response = await request(app)
            .delete(`/api/orders/${newOrder.body.id}`)
            .set('Cookie', cookie)
            .expect(200);
        expect(natsWrapper.client.publish).toBeCalled()
    })
});
