import {Listener, TicketCreatedEvent, Subjects} from "@nkticketing/common";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../models/Ticket";

export class TicketCreateListener extends Listener<TicketCreatedEvent>{
    queueGroupName: string = 'order-service';
    readonly subject = Subjects.TicketCreated;

    async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
        const {id, title, price} = data;
        const ticket = Ticket.build({
            id,
            title,
            price,
        })
        console.log('ticket-created-listener.ts: ', {ticket})
        await ticket.save();
        msg.ack();
    }

}