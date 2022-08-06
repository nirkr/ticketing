import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@nkticketing/common'
import { User } from '../models/user';

const router = express.Router();

router.post ('/api/user/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({min:4 , max:20})
            .withMessage('Password must between 4 and 20 characters')
    ],
    validateRequest,
    async (req:Request,res:Response) => {
    const {email, password} = req.body;
    const existingUser = await User.findOne({email});
    if (existingUser){
        throw new BadRequestError('user exists already');
    }
    const user = User.build({  // Schema object function
        email, password
    });
    await user.save(); // userDoc (/row) function

    const jwtUser = jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.JWT_KEY!);

    req.session = {
        jwt: jwtUser
    }

    res.status(201).send ({
        // user: {
        //     id: user._id,
        //     email: user.email
        // }
        user
    });
});

export {router as signUpRouter};