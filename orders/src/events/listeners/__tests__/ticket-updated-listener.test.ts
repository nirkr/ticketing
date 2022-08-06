import {Message} from "node-nats-streaming";
import mongoose from "mongoose";
import {TicketUpdatedEvent} from "@nkticketing/common";
import {TicketUpdateListener} from "../ticket-update-listener";
import {Ticket} from "../../../models/Ticket";
import {natsWrapper} from "../../../nats-wrapper";

const setup = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    const ticketListener = new TicketUpdateListener(natsWrapper.client)
    const data: TicketUpdatedEvent["data"] = {
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: ticket.version + 1
    }

    //of Message object non-declaring
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { ticketListener, data, msg}
};

describe('ticket-created-tests', ()=> {
    it('should get update event and update record in db', async () => {
        const {ticketListener, data, msg} = await setup();

        await ticketListener.onMessage(data, msg);

        const updatedTicket = await Ticket.findById(data.id);
        expect(updatedTicket!.price).toEqual(data.price);
        expect(updatedTicket!.title).toEqual(data.title);
        expect(updatedTicket!.version).toEqual(data.version);
        expect(msg.ack).toBeCalled()
    });

    it('should get an error when the updated version is not exacly one version above', async () => {
        const {ticketListener, data: createData, msg} = await setup();

        const data:TicketUpdatedEvent['data'] = {
            id: createData.id,
            title: createData.title,
            price: 100,
            userId: createData.userId,
            version: 2
        };

        try {
            await ticketListener.onMessage(data, msg);
        }
        catch (e) {
            expect(msg.ack).not.toBeCalled()
        }
    });
});
