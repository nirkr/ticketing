import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCancelledEvent} from "@nkticketing/common";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/Ticket";
import mongoose from "mongoose";

const setup = async () => {
    const orderId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: '123',
    })
    ticket.set({ orderId });
    await ticket.save();
    const orderCancelledListener = new OrderCancelledListener(natsWrapper.client);
    const data: OrderCancelledEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket.id,
        }
    };
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { orderCancelledListener, data, msg}
}

describe('order-Cancelled-listener tests', ()=> {
    it('should get the order-create event and update order_id in the related ticket ', async () => {
        const {orderCancelledListener, data, msg } = await setup();
        console.log({data});
        await orderCancelledListener.onMessage(data, msg);

        const updatedTicket = await Ticket.findById(data.ticket.id);
        console.log({updatedTicket});
        expect(updatedTicket!.orderId).not.toBeDefined();
    });

    it('should execute ack function', async () => {
        const {orderCancelledListener, data, msg } = await setup();
        await orderCancelledListener.onMessage(data, msg);
        expect(msg.ack).toBeCalled();
    });

    it('should emit publish updateTicket event once order is created ', async () => {
        const {orderCancelledListener, data, msg } = await setup();
        await orderCancelledListener.onMessage(data, msg);
        expect(natsWrapper.client.publish).toBeCalled();

        const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
        expect(ticketUpdatedData.id).toEqual(data.ticket.id);
    });

})