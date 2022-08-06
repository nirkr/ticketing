import {OrderCreatedEvent, Publisher, Subjects} from '@nkticketing/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    onPublish(data: OrderCreatedEvent["data"]): void {
        console.log(`order-created-publisher.ts: ${JSON.stringify(data)}`)
    }

    readonly subject = Subjects.OrderCreated;
//  -- NEED TO CHECK IF THE VERSION WORKS
}