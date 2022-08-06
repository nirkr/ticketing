import {Message} from "node-nats-streaming";
import {TicketCreatedEvent} from "@nkticketing/common";
import {TicketCreateListener} from "../ticket-create-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/Ticket";
import mongoose from "mongoose";

const setup = async () => {
    const ticketListener = new TicketCreateListener(natsWrapper.client)
    const data: TicketCreatedEvent["data"] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    }
    // of Message object non-declaring
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { ticketListener, data, msg}
};

describe('ticket-created-tests', ()=> {
    it('should get the event and create ticket in service a ticket in Ticket DB', async() => {
        // create an event
        const {ticketListener, data, msg} = await setup();
        await ticketListener.onMessage(data, msg)

        // load it from DB
        const record = await Ticket.findById(data.id);
        expect(record).toBeDefined();
        expect(record!.title).toEqual(data.title);
    });

    it('should ack the message', async () => {
        const {ticketListener, data, msg} = await setup();

        await ticketListener.onMessage(data, msg)
        expect(msg.ack).toBeCalled();
    });
})
