import express, {Request, Response} from 'express'
import {body} from 'express-validator';
import {Ticket} from '../models/Ticket'
import {NotFoundError, requireAuth, validateRequest, NotAuthorizedError, BadRequestError} from '@nkticketing/common'
import {ticketUpdatedPublisher} from '../events/publishers/ticket-updated-publisher';
import {natsWrapper} from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id',
    [
        // body('title')
        //     .notEmpty()
        //     .withMessage('Title is required'),
        body('price')
            .isFloat({ gt : 0 })
            .withMessage('Price must be greater than 0'),
    ], requireAuth, validateRequest,
    async (req:Request, res:Response)=> {
    const {title, price} = req.body;
    const publisher = new ticketUpdatedPublisher(natsWrapper.client);
        console.log(req.params.id);
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket){
        throw new NotFoundError();
    }
    if (ticket.orderId){
        throw new BadRequestError('Cannot edit a reserved ticket');
    }
    if (ticket.userId !== req.currentUser!.id) {
        //  checks who does this check has the same id as the userId saved on the ticket
        throw new NotAuthorizedError();
    }
    ticket.set({
        price
    });
    if (title) {
        ticket.set({title})
    }
    await publisher.publish({
        id: ticket.id,
        price: ticket.price,
        title: ticket.title,
        userId: ticket.userId,
        version: ticket.version,
    });
    await ticket.save();
    res.status(200).send(ticket)
})

export {router as updateRouter}