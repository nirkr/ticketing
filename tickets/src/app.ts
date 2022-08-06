import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { NotFoundError, errorHandler, currentUser } from "@nkticketing/common";

import {creatTicketRouter} from './routes/new';
import {showTicketRouter} from './routes/show';
import {getAllRouter} from './routes/index';
import {updateRouter} from './routes/update';

const app = express();
// traffic is being proxied to our app through NGINX -
// express will be familiar with https & proxy.
app.set("trust proxy", true);
app.use(json());
app.use(
    cookieSession({
        signed: false, // no need, because jwt is already encrypted
        secure: process.env.NODE_ENV !== "test", // https connection requirement - considering TEST ENV
        maxAge: 100000,
    })
);
app.use(currentUser);
app.use(creatTicketRouter);
app.use(showTicketRouter);
app.use(getAllRouter);
app.use(updateRouter);
// if there is already next(error) from previous routes/middlewares => will not enter here (GET/POST/ALL etc)
// will jump to next middleware (in our case error-handling middleware)
app.all("*", () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
