import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/current-user";
import { signUpRouter } from "./routes/signup";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { NotFoundError, errorHandler } from "@nkticketing/common";

const app = express();
// traffic is being proxied to our app through NGINX -
// express will be familiar with https & proxy.
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false, // no need, because jwt is already encrypted
    secure: process.env.NODE_ENV !== "test", // https connection requirement - considering TEST ENV
    maxAge: 10000000,
  })
);

app.use(currentUserRouter);
app.use(signUpRouter);
app.use(signoutRouter);
app.use(signinRouter);

// if there is already next(error) from previous routes/middlewares => will not enter here (GET/POST/ALL etc)
// will jump to next middleware (in our case error-handling middleware)
app.all("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
