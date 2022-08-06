import nats from 'node-nats-streaming';
import {ticketCreatedPublisher} from "./events/ticket-created-publisher";

const stan = nats.connect('ticketing','abc', {
    url: 'http://localhost:4222'
});

stan.on('connect', async() => {
    console.log('nats publisher is connected')
    const ticket = {
        title: 'concert',
        price: 20,
        userId: 12465
    }
    const publisher = new ticketCreatedPublisher(stan);
    await publisher.publish({
        title: 'concert',
        price: 20,
        userId: 12465
    })
});
