import request from "supertest";
import {app} from '../../app';
import mongoose from "mongoose";
import {natsWrapper} from '../../nats-wrapper'
import {Ticket} from "../../models/Ticket";

describe('update tests', ()=>{
    const ticket = {
        title: 'nir',
        price: 20
    };
  it('returns 404 if ticket id does not exist', async ()=>{
      const mongoTicketId = new mongoose.Types.ObjectId().toHexString();
      await request(app)
        .put(`/api/tickets/${mongoTicketId}`)
          .set('Cookie', global.getCookie())
        .send(ticket)
        .expect(404)
  })

  it('returns 401 if user is not authenticated', async ()=>{
      const response = await request(app)
          .post('/api/tickets')
          .set('Cookie', global.getCookie())
          .send(ticket)
          .expect(201)
      await request(app)
          .put(`/api/tickets/${response.body.id}`)
          // .set('Cookie', global.getCookie())
          .send(ticket)
          .expect(401)
  });

  it('returns 401 if ticket is not related to the user', async ()=>{
      const response = await request(app)
          .post('/api/tickets')
          .set('Cookie', global.getCookie())
          .send(ticket)
          .expect(201);
      await request(app)
          .put(`/api/tickets/${response.body.id}`)
          .set('Cookie', global.getCookie())
          .send({
              title: 'nir',
              price: 1000
          })
          .expect(401);
  });

  it('returns 400 for invalid input in update api',async()=> {
      const cookie = global.getCookie(); // now it will be the exact user in create & update
      const response = await request(app)
          .post('/api/tickets')
          .set('Cookie', cookie)
          .send(ticket)
          .expect(201);
      await request(app)
          .put(`/api/tickets/${response.body.id}`)
          .set('Cookie', cookie)
          .send({
              title: '',
              price: 20
          })
          .expect(400)
      await request(app)
          .put(`/api/tickets/${response.body.id}`)
          .set('Cookie', cookie)
          .send({
              title: 'nir',
              price: 0
          })
          .expect(400)
  })

  it('returns 200 & update ticket price', async ()=>{
      const newPrice = 30;
      const newTitle = 'nir_new';
      const cookie = global.getCookie(); // now it will be the exact user in create & update
      const response = await request(app)
          .post('/api/tickets')
          .set('Cookie', cookie)
          .send(ticket)
          .expect(201)
      await request(app)
          .put(`/api/tickets/${response.body.id}`)
          .set('Cookie', cookie)
          .send({
              title: newTitle,
              price: newPrice
          })
          .expect(200);

      const ticketResponse = await request(app)
          .get(`/api/tickets/${response.body.id}`)
          .send();
      expect(ticketResponse.body.price).toBe(newPrice)
      expect(ticketResponse.body.title).toBe(newTitle)
  })

    it('publishes an event', async ()=>{
        const newPrice = 30;
        const newTitle = 'nir_new';
        const cookie = global.getCookie(); // now it will be the exact user in create & update
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send(ticket)
            .expect(201)
        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', cookie)
            .send({
                title: newTitle,
                price: newPrice
            })
            .expect(200);
        expect(natsWrapper.client.publish).toBeCalled();
    })
    it('should reject update of a reserved ticket', async () => {
        const newPrice = 30;
        const cookie = global.getCookie();
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send(ticket)
            .expect(201)
        const newTicket = await Ticket.findById(response.body.id);
        newTicket!.set({orderId: mongoose.Types.ObjectId().toHexString()});
        await newTicket!.save();

        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', cookie)
            .send({
                price: newPrice
            })
            .expect(400);
    });
});