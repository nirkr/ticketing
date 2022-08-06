import mongoose from 'mongoose';
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'

// An interface that describes the properties
// that are requried to create a new Order
interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}

// An interface that describes the properties
// that a Order Model has
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

// An interface that describes the properties
// that a Order Document has
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?: string; // optional because new ticket is without an order
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
    }
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
ticketSchema.plugin(updateIfCurrentPlugin); // increments the record's version

ticketSchema.statics.build = (attr:TicketAttrs) => {
    return new Ticket(attr) ;
}

const Ticket = mongoose.model<TicketDoc,TicketModel>('Ticket', ticketSchema);

export { Ticket };