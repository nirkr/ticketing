import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCreatedEvent, OrderStatus} from "@nkticketing/common";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/Ticket";
import mongoose from "mongoose";

const setup = async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: '123',
    })
    await ticket.save();
    const orderCreatedListener = new OrderCreatedListener(natsWrapper.client);
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: ticket.userId,
        status: OrderStatus.Created,
        expiredAt: new Date(),
        ticket:{
            id: ticket.id,
            price: ticket.price,
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { orderCreatedListener, data, msg}
}

describe('order-created-listener tests', ()=> {
    it('should get the order-create event and update order_id in the related ticket ', async () => {
        const {orderCreatedListener, data, msg } = await setup();
        await orderCreatedListener.onMessage(data, msg);

        const updatedTicket = await Ticket.findById(data.ticket.id);
        expect(updatedTicket!.orderId).toEqual(data.id)
    });

    it('should execute ack function', async () => {
        const {orderCreatedListener, data, msg } = await setup();
        await orderCreatedListener.onMessage(data, msg);
        expect(msg.ack).toBeCalled();
    });

    // In order to make sure ticket versions are adjusted in all the services containing the ticket
    // => (for now, Order service)
    it('should emit publish updateTicket event once order is created ', async () => {
        const {orderCreatedListener, data, msg } = await setup();
        await orderCreatedListener.onMessage(data, msg);
        expect(natsWrapper.client.publish).toBeCalled();

        const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
        expect(ticketUpdatedData.id).toEqual(data.ticket.id);
    });
})