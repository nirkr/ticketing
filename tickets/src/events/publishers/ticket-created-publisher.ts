import {Publisher, TicketCreatedEvent, Subjects} from '@nkticketing/common';

export class ticketCreatedPublisher extends Publisher<TicketCreatedEvent> {

    // subject:subjects.TicketCreated = subjects.TicketCreated;
    // without the type declare, typescript thinks we would like to change the subject in the future (this  .subject=...)
    // can use readonly declaration instead of subject:
    readonly subject = Subjects.TicketCreated;

    onPublish(data: TicketCreatedEvent["data"]): void {
        console.log('ticket-created-publisher.ts: event was published: ', data)
    }

}