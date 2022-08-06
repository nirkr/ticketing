import {Publisher, OrderCancelledEvent, Subjects} from '@nkticketing/common';

export class OrderCancelledPublisherr extends Publisher<OrderCancelledEvent>{
    onPublish(data: OrderCancelledEvent["data"]): void {
        console.log(`order-cancelled-publisher.ts: ${JSON.stringify(data)}`)
    }

    // subject: OrderCancelledEvent["subject"];
    readonly subject = Subjects.OrderCancelled;

}