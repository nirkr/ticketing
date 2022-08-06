import {Listener, OrderCreatedEvent, Subjects} from "@nkticketing/common";
import { Message } from "node-nats-streaming";
import { Order} from "../../models/Order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    async onMessage(data: OrderCreatedEvent["data"], msg: Message){
        console.log(`order-created-listener event(order data): ${JSON.stringify(data)}`);
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version,
        })
        await order.save();
        
        msg.ack();
    }

    queueGroupName: string = 'payment-service';
    subject: OrderCreatedEvent["subject"] = Subjects.OrderCreated;

}