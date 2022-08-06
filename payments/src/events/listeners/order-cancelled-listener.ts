import {Listener, OrderCancelledEvent, OrderStatus, Subjects} from "@nkticketing/common";
import {Message} from "node-nats-streaming";
import {Order} from "../../models/Order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        console.log(`order-cancelled-listener event(order data): ${JSON.stringify(data)}`);
        // const order = await Order.findById(data.id)
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        })
        if (!order){
            throw new Error('Order was not found');
        }
        order.set({
            status: OrderStatus.Cancelled
        })
        await order.save();

        msg.ack();
    }

    queueGroupName: string = 'payment-service';
    subject: OrderCancelledEvent["subject"] = Subjects.OrderCancelled;


}