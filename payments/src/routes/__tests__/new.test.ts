import request from "supertest";
import mongoose from "mongoose";
import {app} from '../../app';
import {Order } from '../../models/Order'
import {OrderStatus} from '@nkticketing/common'
import {stripe} from '../../stripe';
import { Payment } from "../../models/Payment";

describe('new payments test', ()=>{
    it('returns 404 when input order DOESNT exist', async ()=> {
        const res = await request(app)
        .post('/api/payments')
        .set('Cookie', global.getCookie())
        .send({
            orderId: mongoose.Types.ObjectId().toHexString(),
            token: '123'
        })
        expect(res.status).toEqual(404);
    })
    it('returns 401 when order NOT belongs to the user which pays', async ()=> {
        const order = Order.build({
            id: mongoose.Types.ObjectId().toHexString(),
            version: 0,
            status: OrderStatus.Created,
            userId: '123',
            price: 20
        });
        await order.save();
        const res = await request(app)
        .post('/api/payments')
        .set('Cookie', global.getCookie())
        .send({
            orderId: order.id,
            token: '123'
        })
        expect(res.status).toEqual(401);
    })
    it('returns 400 when purchasing a cancelled order', async()=> {
        const userId = mongoose.Types.ObjectId().toHexString();
        const order = Order.build({
            id: mongoose.Types.ObjectId().toHexString(),
            version: 0,
            status: OrderStatus.Cancelled,
            userId,
            price: 20
        });       
        await order.save();
        const res = await request(app)
        .post('/api/payments')
        .set('Cookie', global.getCookie(userId))
        .send({
            orderId: order.id,
            token: '123'
        })
        expect(res.status).toEqual(400);
    });

    it('uses jest stripe mock and creates charge while calling new charge, will response with 201', async() => {
        const userId = mongoose.Types.ObjectId().toHexString();
        const price = Math.floor(Math.random()*10000)
        const order = Order.build({
            id: mongoose.Types.ObjectId().toHexString(),
            version: 0,
            status: OrderStatus.Created,
            userId,
            price
        });       
        await order.save();
        await request(app)
        .post('/api/payments')
        .set('Cookie', global.getCookie(userId))
        .send({
            orderId: order.id,
            token: 'tok_visa'
        })
        expect(201);
        const charges = await stripe.charges.list({limit:50});
        const stripeCharge = charges.data.find(charge => charge.amount===price*100)
        
        expect(stripeCharge).toBeDefined();
        expect(stripeCharge?.currency).toEqual('usd');

        const payment = await Payment.findOne({
            order_id: order.id,
            stripe_id: stripeCharge!.id
        });
    
        expect (payment).not.toBeNull();
        // const stripeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
        // expect(stripeOptions.currency).toEqual('USD');
        // expect(stripeOptions.source).toEqual('tok_visa');
        // expect(stripeOptions.amount).toEqual(order.price * 100);
    })
    it('change order status to payed', ()=> {})
    it('emit payment event', ()=> {})
})