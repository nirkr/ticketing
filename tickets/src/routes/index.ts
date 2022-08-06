import express, {Request, Response} from 'express'
import {Ticket} from "../models/Ticket";

const router = express.Router();

router.get('/api/tickets', async (req:Request, res:Response)=> {
    try {
        const data = await Ticket.find({});
        res.send(data)
    }
    catch (e){
        console.log('w')
    }
})

export { router as getAllRouter }