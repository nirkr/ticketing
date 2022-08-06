import request from 'supertest';
import mongoose from "mongoose"; // for generating valid mongoose id
import {app} from '../../app';
import {Order, OrderStatus} from "../../models/Order";
import {Ticket} from "../../models/Ticket";
import {natsWrapper} from "../../nats-wrapper";

describe('new order tests', ()=> {

    const ticketId = mongoose.Types.ObjectId().toHexString();

    it('should get 401 when not authenticated', async ()=>{
        await request(app)
            .post('/api/orders')
            .send({})
            .expect(401);
    });

    it('should get 404 when ticket is not found', async ()=>{
        await request(app)
            .post('/api/orders')
            .set('Cookie',global.getCookie() )
            .send({ticketId})
            .expect(404);
    });
    it('should get 400 when ticket is reserved', async ()=>{
        const ticket = Ticket.build({
            title: 'ticket',
            price: 20
        });
        await ticket.save();
        const order = Order.build({
            ticket,
            expiresAt: new Date(),
            status: OrderStatus.Created,
            userId: 'abcdefg',
        });
        await order.save();
        await request(app)
            .post('/api/orders')
            .set("Cookie", global.getCookie())
            .send({ticketId: ticket.id})
            .expect(400)
    });
    it('should create an order - reserve a ticket, and get 201', async ()=>{
        const ticket = Ticket.build({
            title: 'ticket',
            price: 20
        });
        await ticket.save();
        await request(app)
            .post('/api/orders')
            .set("Cookie", global.getCookie())
            .send({ticketId: ticket.id})
            .expect(201)
    });
    it('should emit publish order event', async ()=>{
        const ticket = Ticket.build({
            title: 'ticket',
            price: 20
        });
        await ticket.save();
        await request(app)
            .post('/api/orders')
            .set("Cookie", global.getCookie())
            .send({ticketId: ticket.id})
            .expect(201)
        expect(natsWrapper.client.publish).toBeCalled();
    });
});