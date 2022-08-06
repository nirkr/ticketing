import {Stan} from "node-nats-streaming";
import {Subjects} from "./subjects";

interface event {
    subject: Subjects,
    data: any
}

export abstract class Publisher<T extends event> {
    private client: Stan;
    abstract subject: T['subject'];

    abstract onPublish(data: T['data']): void;
    constructor(client: Stan) {
        this.client = client;
    }

    publish(data: T['data']) {
        this.client.publish(this.subject, JSON.stringify(data), () => {
            this.onPublish(data);
        });
    }
}