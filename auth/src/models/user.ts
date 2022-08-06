import mongoose from 'mongoose';
import { toHash, compare } from '../services/password';

// An interface that describes the properties
// that are requried to create a new User
interface UserAttrs {
    email: string;
    password: string;
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
},{
        toJSON: {
        transform (doc:any, ret:any){
            // ret is the object that turn into JSON
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
        }
    }
});

// userSchema.pre('save', async function (done){
userSchema.pre('save', async function (done){
    if (this.isModified('password')){
        const hashed = await toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

userSchema.statics.build = (attr:UserAttrs) => {
    return new User(attr) ;
}

const User = mongoose.model<UserDoc,UserModel>('User', userSchema);

export { User };