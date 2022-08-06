import {Listener, OrderCancelledEvent, Subjects} from "@nkticketing/common";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../models/Ticket";
import {ticketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    queueGroupName: string = 'ticket-service';
    subject: OrderCancelledEvent["subject"] = Subjects.OrderCancelled;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message){
        console.log(`order-cancelled-listener event: ${JSON.stringify(data)}`);
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket){
            throw new Error('Ticket was not found');
        }
        ticket.set({
            orderId: undefined // null is less good for TS & optional values
        })
        await ticket.save();
        await new ticketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            version: ticket.version,
        })
        msg.ack();
    }

}

export {OrderCancelledListener};