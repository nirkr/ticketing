import Queue from 'bull';
import { ExpirationCompletedPublisher } from '../events/publishers/expiration-completed-publisher';
import {natsWrapper} from "../nats-wrapper";

interface Payload{
    orderId:string,
}

const expirationQueue = new Queue<Payload>('order:expiration', {
   redis: {
       host: process.env.REDIS_HOST
   }
});

// THIS IS THE FUNCTION WHICH HANDLING the job operation of the server
// the queue is managed by REDIS
expirationQueue.process(async (job:any) => {
    await new ExpirationCompletedPublisher(natsWrapper.client).publish({
        orderId: job.data.orderId,
    });
});

export {expirationQueue}