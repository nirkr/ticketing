import {Message, Stan} from "node-nats-streaming";
import {Listener} from './base-listener';
import {TicketCreatedEvent} from './ticket-created-event'
import {Subjects} from './subjects'

export class ticketCreatedListener extends Listener<TicketCreatedEvent> {

    queueGroupName = 'payment-service';
    // subject:subjects.TicketCreated = subjects.TicketCreated;
    // without the type declare, typescript thinks we would like to change the subject in the future (this.subject=...)
    // can use readonly declaration instead of subjectg:
    readonly subject = Subjects.TicketCreated;

    onMessage(data: TicketCreatedEvent["data"], msg: Message) {
        console.log(data);
        console.log({});

        msg.ack();
    }

}