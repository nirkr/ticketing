import express, {Request, Response} from 'express'
import {Order, OrderStatus} from '../models/Order'
import {NotFoundError, requireAuth, NotAuthorizedError, BadRequestError} from '@nkticketing/common'
import {OrderCancelledPublisherr} from "../events/publishers/order-cancelled-publisherr";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.delete('/api/orders/:id',
    requireAuth,
    async (req:Request, res:Response)=> {
    const order = await Order.findById(req.params.id).populate('ticket');
    if (!order){
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        //  checks the excuter has the same id as the userId saved on the order
        throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Complete){
        throw new BadRequestError('this status is payed already!')
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    // emit cancellation event
        const publisher = new OrderCancelledPublisherr(natsWrapper.client);
        try {
            await publisher.publish({
                id: order.id,
                version: order.version,
                ticket: {
                    id: order.ticket.id,
                }
            })
        }
        catch (e:any) {
            throw new Error(e);
        }

    res.status(200).send(order);
    // DELETE STATUS = 204! / here we actually not deleting - we can use PATCH method
})

export {router as deleteOrderRouter}