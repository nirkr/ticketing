import mongoose from "mongoose";
import express, {Request, Response} from 'express';
import {body} from 'express-validator'
import {validateRequest, requireAuth, NotFoundError, BadRequestError} from '@nkticketing/common';
import { Order, OrderStatus} from '../models/Order';
import { Ticket } from '../models/Ticket';
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";

import {natsWrapper} from '../nats-wrapper'

const router = express.Router();

router.post('/api/orders',[
    body('ticketId')
        .notEmpty()
        .custom((input:string)=> mongoose.Types.ObjectId.isValid(input)) // creates coupling of this service with mongo DB - need to be aware of that.
        .withMessage('ticketId is required'),
], requireAuth, validateRequest ,async (req:Request, res:Response)=> {
    const { ticketId } = req.body;
    const exp = 60;
    //find the ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket){
        console.log('ERRORR - not found');
        
        throw new NotFoundError();
    }
    //make sure the ticket is not reserved
    const isReserved = await ticket.isReserved();
    if (isReserved){
        throw new BadRequestError('ticket is reserved');
    }
    // calculate expiration date to the order
    const expiration = new Date();
    // expiration.setSeconds(expiration.getSeconds() + parseInt(process.env.EXPIRATION_WINDOW_SECONDS!));
    expiration.setSeconds(expiration.getSeconds() + (exp));
    // save order to DB
    const order = Order.build({
        status: OrderStatus.Created,
        expiresAt: expiration,
        userId: req.currentUser!.id,
        ticket,
    });
    await order.save();
    const publisher = new OrderCreatedPublisher(natsWrapper.client);
    try {
        await publisher.publish({
            expiredAt: order.expiresAt,
            version: order.version,
            id: order.id,
            status: order.status,
            ticket: {
                id: ticket.id,
                price: ticket.price,
            },
            userId: order.userId
        });
    }
    catch (e:any) {
        throw new Error(e)
    }
    res.status(201).send(order);
});
export {router as creatOrderRouter};