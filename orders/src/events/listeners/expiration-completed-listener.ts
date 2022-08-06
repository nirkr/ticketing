import { Message } from "node-nats-streaming";
import {Order, OrderStatus} from '../../models/Order';
import {ExpirationCompletedEvent, Listener, Subjects} from "@nkticketing/common";
import {OrderCancelledPublisherr} from '../publishers/order-cancelled-publisherr'

export class ExpirationCompletedListener extends Listener<ExpirationCompletedEvent>{
    async onMessage(data: ExpirationCompletedEvent["data"], msg: Message) {
        console.log(`expiration-completed-event: ${JSON.stringify(data)}`);
        const order = await Order.findById(data.orderId).populate('ticket');
        if (!order){
            throw new Error('order was not found')
        }
        if (order.status === OrderStatus.Complete){
            return msg.ack();
        }
        order.set({
            status: OrderStatus.Cancelled
        })
        await order.save();
        const publisher = new OrderCancelledPublisherr(this.client);
            await publisher.publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            },
        });

        msg.ack();
    }

    queueGroupName: string = 'order-service';
    subject: ExpirationCompletedEvent["subject"]= Subjects.ExpirationCompleted;
}