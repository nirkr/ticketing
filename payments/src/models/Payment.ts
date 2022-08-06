import mongoose from "mongoose";

interface PaymentAttrs {
    order_id: string,
    stripe_id: String
}

interface PaymentDoc extends mongoose.Document {
    order_id: string,
    stripe_id: string
}

interface PaymentModel extends mongoose.Model<PaymentDoc>{
    build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
    order_id: {
        type: String,
        required: true
    },
    stripe_id: {
        type: String,
        required: true
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


paymentSchema.statics.build = (attr:PaymentAttrs) => {
    return new Payment(attr) ;
}


const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment }