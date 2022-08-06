import mongoose from 'mongoose';
import {updateIfCurrentPlugin} from "mongoose-update-if-current";
import {Order, OrderStatus} from "./Order";
import * as events from "events";

// An interface that describes the properties
// that are requried to create a new Order
interface TicketAttrs {
    id:string,
    title: string;
    price: number;
}

// An interface that describes the properties
// that a Order Model has
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: {}): TicketDoc;
    findEvent(event: {id: string, version: number}): Promise<TicketDoc | null>;
}

// An interface that describes the properties
// that a Order Document has
export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
},{
    toJSON: {
        transform (doc:any, ret:any){
            // ret is the object that turn into JSON
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attr:TicketAttrs) => {
    return new Ticket({
        _id:attr.id, // for having the same _id between Order & Ticket service
        price: attr.price,
        title: attr.title,
    }) ;
};
ticketSchema.statics.findEvent = (event: {id:string, version: number}) => {
    return Ticket.findOne({
    _id: event.id,
    // get exactly the previous version of the record
    version: event.version - 1
    })
};

ticketSchema.methods.isReserved = async function () {
    const existingOrder = await Order.findOne({ // find order with specific ticket
        ticket: this as any, // refers to current Ticket doc - configured in TicketDoc
        status: { // all statuses except cancelled ticket
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete,
            ]
        }
    });
    return !!existingOrder;
}
const Ticket = mongoose.model<TicketDoc,TicketModel>('Ticket', ticketSchema);

export { Ticket };