import  {OrderCreatedEvent, Listener, Subjects} from "@nkticketing/common";
import {Message} from "node-nats-streaming";
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        console.log(`order-created-listener event(order data): ${JSON.stringify(data)}`);
        // redis bull operation
        const delay = new Date(data.expiredAt).getTime() - new Date().getTime()
        await expirationQueue.add({
            orderId: data.id,
        }, {
            delay
        });
        // emit expiration:completed event - in the expiration queue file
        msg.ack()
    }

    queueGroupName='expiration-service';
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
}