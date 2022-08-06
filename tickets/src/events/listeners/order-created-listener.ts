import {Listener, OrderCreatedEvent, Subjects} from "@nkticketing/common";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../models/Ticket";
import { ticketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

class OrderCreatedListener extends Listener<OrderCreatedEvent>{

    queueGroupName: string = 'ticket-service';
    subject: OrderCreatedEvent["subject"] = Subjects.OrderCreated;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message){
        console.log(`order-created-listener event(order data): ${JSON.stringify(data)}`);
        const ticket = await Ticket.findById(data.ticket.id);
        if(!ticket){
            throw new Error('ticket was not found');
        }
        ticket.set({
            orderId: data.id
        });
        await ticket.save();
        console.log({newVersion: ticket.version})
        await new ticketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
        })
        msg.ack();
    }
}

export {OrderCreatedListener}; 