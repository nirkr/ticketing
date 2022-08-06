import mongoose from 'mongoose';
import {updateIfCurrentPlugin} from "mongoose-update-if-current";
import { OrderStatus } from '@nkticketing/common';
import {TicketDoc} from './Ticket';

export {OrderStatus};
// An interface that describes the properties
// that are requried to create a new Order
interface OrderAttrs {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

// An interface that describes the properties
// that a Order Model has
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

// An interface that describes the properties
// that a Order Document has
interface OrderDoc extends mongoose.Document {
    status: OrderStatus;
    expiresAt: Date;
    userId: string;
    ticket: TicketDoc;
    version: number;
}

const orderSchema = new mongoose.Schema({
    status: {
        type: OrderStatus,
        required: true
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date,
    },
    userId: {
        type: String,
        required: true
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
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

orderSchema.set('versionKey','version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attr:OrderAttrs) => {
    return new Order(attr) ;
}

const Order = mongoose.model<OrderDoc,OrderModel>('Order', orderSchema);

export { Order };