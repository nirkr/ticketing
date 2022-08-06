import { OrderStatus } from '@nkticketing/common'
import {updateIfCurrentPlugin} from "mongoose-update-if-current";
import mongoose from "mongoose";

export {OrderStatus} ;

interface OrderAttrs {
    id: string,
    status: OrderStatus,
    userId: string,
    price: number,
    version: number,
}

interface OrderDoc extends mongoose.Document {
    status: OrderStatus,
    userId: string,
    price: number,
    version: number
}

interface OrderModel extends mongoose.Model<OrderDoc>{
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
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
    return new Order({
        _id: attr.id,
        version: attr.version,
        status: attr.status,
        userId: attr.userId,
        price: attr.price,
    }) ;
}


const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order }