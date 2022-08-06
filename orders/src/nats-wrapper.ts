import nats, {Stan} from "node-nats-streaming";

class NatsWrapper { // NATS client
    private _client?: Stan ; // "?" - where a variable might be undefined for a while

    // creating getter for client allows using this.client(AND NOT _client).
    // an use that here and in consumers
    get client() {
        if (!this._client) {
            throw new Error('nats client is not configureddd')
        }
        return this._client;
    }
    connect(clusterId: string, clientId: string, url: string){
        this._client = nats.connect(clusterId, clientId, { url });
        return new Promise<void>((resolve,reject)=> { // <void> is for resolve()
             // ! - dont worry TS, this variable is not undefined
            this.client.on('connect', ()=> {
                console.log('NATS is connected!!!');
                resolve();
            });
            this.client.on('connect', (err)=> {
                reject(err);
            });
        });
    }
}

// exporting just the Class instance (singleton), and not the CLASS ITSELF
export const natsWrapper = new NatsWrapper();