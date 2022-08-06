import request from "supertest";
import {app} from '../../app';
import {Ticket} from "../../models/Ticket";

const createTicket = async () => {
    const ticket = Ticket.build({
        title: "concert",
        price: 20,
    })
    await ticket.save();
    return ticket;
}

describe('index tests', ()=>{
    it('get all orders of the user',async()=>{
        const ticket1 = await createTicket();
        const ticket2 = await createTicket();
        const ticket3 = await createTicket();
        const cookie = global.getCookie();

        const promises = [ticket1,ticket2,ticket3].map(ticket => {
            return request(app)
                .post('/api/orders')
                .set("Cookie", cookie)
                .send({ticketId: ticket.id})
                .expect(201)
        })

        await Promise.all(promises);
        const data = await request(app)
            .get('/api/orders')
            .set("Cookie", cookie)
            .send()
            .expect(200)
        expect(data.body.length).toBe(3)
    })
})