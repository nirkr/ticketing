import {Publisher, ExpirationCompletedEvent, Subjects} from '@nkticketing/common';

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent>{
    onPublish(data: ExpirationCompletedEvent["data"]): void {
        console.log(`expiration-completed-publisher.ts: ${JSON.stringify(data)}`)
    }

    // subject: OrderCancelledEvent["subject"];
    readonly subject = Subjects.ExpirationCompleted;
}