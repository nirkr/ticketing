import express, {Request, Response} from 'express'
import {Order} from "../models/Order";
import {requireAuth} from '@nkticketing/common'

const router = express.Router();

router.get('/api/orders', requireAuth, async (req:Request, res:Response)=> {
    try {
        const orders = await Order.find({
           userId: req.currentUser!.id}).populate('ticket');
        res.send(orders);
    }
    catch (e){
        console.log('w')
    }
})

export { router as getAllRouter }