import express, {Request, Response} from 'express'
import {Ticket} from '../models/Ticket'
import {NotFoundError} from '@nkticketing/common'

const router = express.Router();

router.get('/api/tickets/:id',
    async (req : Request, res: Response) => {
    // const ticket = Order.findOne({title});
    const ticket = await Ticket.findById(req.params.id);
        if (!ticket){
            throw new NotFoundError();
        }
    res.status(200).send(
        ticket
    )
});

export {router as showTicketRouter}