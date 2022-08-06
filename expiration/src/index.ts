import {natsWrapper} from './nats-wrapper'
import {randomBytes} from "crypto";
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {

    if (!process.env.NATS_CLUSTER_ID){
        throw new Error('cluster id is not properly defined')
    }
    if (!process.env.NATS_URL){
        throw new Error('nats url is not properly defined')
    }
    if (!process.env.NATS_CLIENT_ID){
        throw new Error('nats client id is not properly defined')
    }
    try {
        // nats url - will get from nats-depl.yaml - service name & port
        // await natsWrapper.connect('ticketing', clientId,
        //     'http://nats-srv:4222');
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID,
            process.env.NATS_URL);
        // maintaining client's closing logics.
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());
        new OrderCreatedListener(natsWrapper.client).listen();
    }
    catch (err) {
        console.error(err);
    }
};
start();
