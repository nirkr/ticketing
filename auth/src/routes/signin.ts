import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import jwt from 'jsonwebtoken';
import {User} from '../models/user';
import {compare} from '../services/password'
import {BadRequestError, validateRequest} from '@nkticketing/common'

const router = express.Router();

router.post('/api/user/signin', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('You must supply a password')
],
    validateRequest,
    async (req: Request, res: Response) => {
    const {email, password} = req.body;
    // check if user exists - put minimal info in message for security reasons
    const checkedUser = await User.findOne({email});
    if (!checkedUser) {
        throw new BadRequestError('Invalid credentials');
    }
    // NIR - jwt verify ==> Resolved in current-user route
    // NIR - if jwt expires / doesnt exist - check hashed password against mongoDB

    // STEVEN - compare passwords, supplied and stored
    const isAuthenticated = await compare(checkedUser.password, password)
    if (!isAuthenticated) {
        throw new BadRequestError('Invalid credentials');
    }
    const jwtUser = jwt.sign({
        id: checkedUser.id,
        email: checkedUser.email
    }, process.env.JWT_KEY!);

    req.session = {
        jwt: jwtUser
    }

    res.status(200).send('ok');
});

export {router as signinRouter};