import mongoose from "mongoose";
import express, {Request, Response} from 'express';
import {body} from 'express-validator'
import { validateRequest, requireAuth, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus, PaymentCreatedEvent } from '@nkticketing/common';
import { Order } from '../models/Order';
import { Payment } from '../models/Payment';
import { stripe } from '../stripe';
import { PaymentCreatedPublisher} from '../events/publishers/payment-created-publihser'
import { natsWrapper } from '../nats-wrapper'

// import {natsWrapper} from '../nats-wrapper'

const router = express.Router();

router.post('/api/payments',[
    body('orderId')
        .notEmpty()
        .custom((input:string)=> mongoose.Types.ObjectId.isValid(input)) // creates coupling of this service with mongo DB - need to be aware of that.
        .withMessage('orderId is required'),
    body('token')
        .notEmpty()
        .withMessage('token is required'),
], requireAuth, validateRequest ,async (req:Request, res:Response)=> {
    const { orderId, token } = req.body;
    const order = await Order.findById(orderId);
    if (!order){
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        //  checks the excuter has the same id as the userId saved on the order
        throw new NotAuthorizedError();
    }   
    if (order.status === OrderStatus.Cancelled){
        throw new BadRequestError('this order is cancelled')
    }
    const charge = await stripe.charges.create({
        amount: order.price * 100, // stripe amount is calculated in cents,
        currency: 'USD',
        source: token,
    });
    const payment = Payment.build({
        order_id: orderId,
        stripe_id: charge.id
    });
    await payment.save();
    order.set({
        status: OrderStatus.Complete
    })
    await order.save();
    // emit charge event
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.order_id,
        stripId: payment.stripe_id
    })

    res.status(201).send({ payment: payment.id });
});
export {router as creatChargeRouter};