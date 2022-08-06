import express, {Request, Response} from 'express';
import {body} from 'express-validator'
import {validateRequest, requireAuth} from '@nkticketing/common';
import {Ticket} from '../models/Ticket';
import {ticketCreatedPublisher} from '../events/publishers/ticket-created-publisher'
import {natsWrapper} from '../nats-wrapper'

const router = express.Router();

router.post('/api/tickets', [
    body('title')
        .notEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({gt: 0})
        .withMessage('Price must be greater than 0'),
], validateRequest, requireAuth, async (req: Request, res: Response) => {
    // using the natsWrapper.client - configured in client GETTER - INSIDE the route!!
    const publisher = new ticketCreatedPublisher(natsWrapper.client)
    const {title, price} = req.body;
    // use ticket model and add this ticket to collection
    const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id,
    });
    await ticket.save();
    try {
        await publisher.publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            version: ticket.version,
        });
    } catch (e: any) {
        throw new Error(e);
    }
    res.status(201).send(ticket);
});
export {router as creatTicketRouter};