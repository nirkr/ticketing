import {natsWrapper} from "../../../nats-wrapper";
import {Order, OrderStatus} from "../../../models/Order";
import {ExpirationCompletedListener} from "../expiration-completed-listener";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/Ticket"
import {ExpirationCompletedEvent} from "@nkticketing/common";

describe('expiration-completed-listener tests', ()=> {
    const setup = async () => {
        const ticket = Ticket.build({
            title: 'concert',
            price: 20,
            userId: '123',
        })
        await ticket.save();
        const order = Order.build({
            expiresAt: new Date(),
            status: OrderStatus.Created,
            ticket,
            userId: '123',
        });
        await order.save();
        const expirationCompletedListener = new ExpirationCompletedListener(natsWrapper.client)
        const data: ExpirationCompletedEvent['data'] = {
            orderId: order.id
        }
        // @ts-ignore
        const msg: Message = {
            ack: jest.fn()
        };
        return {expirationCompletedListener, data, msg}
    }

    it('should cancel the order, if the expiration time has completed', async () => {
        const {data, expirationCompletedListener, msg} = await setup();
        await expirationCompletedListener.onMessage({ orderId: data.orderId}, msg);
        const orderWithNewStatus = await Order.findById(data);

        // --------------- check the cancelled new status of the order
        expect(orderWithNewStatus!.status).toEqual(OrderStatus.Cancelled)

        // --------------- check the order-cancel emitting event
        expect(natsWrapper.client.publish).toBeCalled();
        const orderUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
        expect(orderUpdatedData.id).toEqual(data);

        // --------------- check the ack function calling
        expect(msg.ack).toBeCalled();
    });
})