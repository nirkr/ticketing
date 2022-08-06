import { Listener, PaymentCreatedEvent, Subjects, OrderStatus } from '@nkticketing/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/Order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    async onMessage(data: { id: string; orderId: string; stripId: string; }, msg: Message) {
        const order = await Order.findById(data.orderId);
        if (!order){
            throw new Error('order not found')
        };
        order.set({
            status: OrderStatus.Complete
        })
        await order.save();
        msg.ack();
    }
    queueGroupName: string = 'payment-service';

}