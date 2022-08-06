import nats, {Message, Stan} from 'node-nats-streaming';
import {randomBytes} from 'crypto'
import { ticketCreatedListener } from './events/ticket-created-listener';

const clientId = randomBytes(4).toString('hex') // for creating several listener services
const stan = nats.connect('ticketing', clientId, {
    url: 'http://localhost:4222'
}); 

stan.on('connect', () => {
    console.log('listener is available in nats')

    new ticketCreatedListener(stan).listen();

    stan.on('close', () => {
        console.log('NATS connection lost');
        process.exit();
    });
    process.on('SIGINT', () => stan.close());
    process.on('SIGTERM', () => stan.close());
});