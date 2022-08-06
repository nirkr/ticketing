import {Message, Stan} from "node-nats-streaming";
import {Publisher} from "./base-publisher";
import {TicketCreatedEvent} from './ticket-created-event'
import {Subjects} from './subjects'

export class ticketCreatedPublisher extends Publisher<TicketCreatedEvent> {

    queueGroupName = 'payment-service';
    // subject:subjects.TicketCreated = subjects.TicketCreated;
    // without the type declare, typescript thinks we would like to change the subject in the future (this.subject=...)
    // can use readonly declaration instead of subjectg:
    readonly subject = Subjects.TicketCreated;

    onPublish(data: TicketCreatedEvent["data"]): void {
        console.log('event was published: ', data)
    }

}