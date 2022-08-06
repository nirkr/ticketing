import "express-async-errors";
import mongoose from "mongoose";
import {app} from './app'
import {natsWrapper} from './nats-wrapper'
import {randomBytes} from "crypto";
import {TicketCreateListener} from "./events/listeners/ticket-create-listener";
import {TicketUpdateListener} from "./events/listeners/ticket-update-listener";
import {ExpirationCompletedListener} from "./events/listeners/expiration-completed-listener";
import { PaymentCreatedListener } from './events/listeners/payment-create-listener'

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('jwt key is not properly defined')
    }
    if (!process.env.MONGO_URI) {
        throw new Error('mongo uri is not properly defined')
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('cluster id is not properly defined')
    }
    if (!process.env.NATS_URL) {
        throw new Error('nats url is not properly defined')
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('nats client id is not properly defined')
    }
    if (!process.env.EXPIRATION_WINDOW_SECONDS) {
        throw new Error('expiration window is not properly defined')
    }
    const clientId = randomBytes(4).toString('hex') // for creating several listener services
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('Connected to Mongo');
    } catch (err) {
        console.error(err);
    }
        // nats url - will get from nats-depl.yaml - service name & port
        // await natsWrapper.connect('ticketing', clientId,
        //     'http://nats-srv:4222');
    try{
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID,
            process.env.NATS_URL);
        // maintaining client's closing logics.
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        // Listeners
        new TicketCreateListener(natsWrapper.client).listen();
        new TicketUpdateListener(natsWrapper.client).listen();
        new ExpirationCompletedListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log("Listening on port 3000!!!!");
    });
};
start();
