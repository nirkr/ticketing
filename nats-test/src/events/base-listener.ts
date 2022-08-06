import {Message, Stan} from "node-nats-streaming";
import {Subjects} from './subjects'

export interface event {
    subject: Subjects,
    data: any
}

export abstract class Listener<T extends event> {
    private client: Stan;
    abstract subject: T['subject'];
    abstract onMessage(data: T['data'], msg: Message): void;
    abstract queueGroupName: string;
    private ackWait = 5 * 1000;

    constructor(client: Stan) {
        this.client = client;
    }

    subscriptionOptions() {
        return this.client
            .subscriptionOptions()
            .setManualAckMode(true) // for case of failure in process, and for not losing the event
            .setAckWait(this.ackWait)
            .setDeliverAllAvailable()
            // gets all event history - sends all the events.
            // CRITICAL for the first time subscription is online- to have all events emitted in the past.
            .setDurableName(this.queueGroupName)
    }

    parseMessage(msg: Message) {
        const data = msg.getData();
        return typeof data === 'string'
            ? JSON.parse(data)
            : JSON.parse(data.toString('utf8'))
    }

    listen() {
        const subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subscriptionOptions()
        );
        subscription.on('message', (msg: Message) => {
            console.log(
                `Message received: ${this.subject} / ${this.queueGroupName}`
            )
            const parsedMessage = this.parseMessage(msg);
            this.onMessage(parsedMessage, msg);
        });
    }
}