import request from 'supertest';
import {app} from '../../app';
import { Ticket } from "../../models/Ticket";
import {natsWrapper} from '../../nats-wrapper'

describe('new ticket tests', ()=> {
    it('has a router hanlder listening to /api/tickets for post requests', async  () => {
        const response = await request(app)
            .post('/api/tickets')
            .send({});
        expect(response.status).not.toEqual(404);
    });
    it('returns 401 if user is not authenticated', async () => {
        await request(app)
            .post('/api/tickets')
            .send({
                title: 'nir',
                price: 1
            })
            .expect(401);
    });
    it('return not 401 status if user is authenticated', async ()=> {
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', global.getCookie() )
            .send({});
        expect(response.status).not.toEqual(401);
    });
    it('returns an error if invalid title is provided', async () => {
        await request(app)
            .post('/api/tickets')
            .set('Cookie', global.getCookie() )
            .send({
                price: 1
            })
            .expect(400);
    });
    it('returns an error if invalid price is provided', async () => {
        await request(app)
            .post('/api/tickets')
            .set('Cookie', global.getCookie() )
            .send({
                title: 'nir',
                price: 0
            })
            .expect(400);
    });
    it('creates a ticket with valid inputs', async () => {
        let tickets = await Ticket.find({});
        expect(tickets.length).toBe(0);
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', global.getCookie() )
            .send({
                title: 'nir',
                price: 20
            })
            .expect(201);
        tickets = await Ticket.find({});
        expect(tickets.length).toBe(1)
    });

    it('publishes publish event', async()=>{
        await request(app)
            .post('/api/tickets')
            .set('Cookie', global.getCookie() )
            .send({
                title: 'nir',
                price: 20
            })
            .expect(201);
        expect(natsWrapper.client.publish).toBeCalled();
    })
})
