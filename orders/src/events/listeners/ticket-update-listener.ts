import {Message} from "node-nats-streaming";
import { Listener, TicketUpdatedEvent, Subjects} from "@nkticketing/common";
import {Ticket} from "../../models/Ticket";

export class TicketUpdateListener extends Listener<TicketUpdatedEvent>{
    async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
        const {title, price} = data;
        // gets the ticket with version of data.version - 1 => JUST IN THIS CASE event will be executed
        const ticket = await Ticket.findEvent(data)
        if (!ticket){
            throw new Error('Ticket is not found') // including event's version is not in order
        }
        ticket.set({
            title,
            price
        });
        await ticket.save();
        // need to update order which has the ticket ??
        // ==> need to check if ticket is ordered already
        // if order already has an ticket , how can it be updated
        msg.ack();
    }

    queueGroupName: string = 'order-service';
    readonly subject = Subjects.TicketUpdated;

}