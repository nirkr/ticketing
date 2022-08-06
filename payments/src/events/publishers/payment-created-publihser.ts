 import { Publisher, PaymentCreatedEvent, Subjects } from '@nkticketing/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated
    
    onPublish(data: { id: string; orderId: string; stripId: string; }): void {
        console.log('payment-created-publisher.ts: event was published: ', data);        
    }
}