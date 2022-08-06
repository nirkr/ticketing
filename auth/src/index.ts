// import "express-async-errors";
import mongoose from "mongoose";
import { app } from './app'

const start = async () => {
  if (!process.env.JWT_KEY){
     throw new Error('jwt key is not properly defined')
  }
  if (!process.env.MONGO_URI){
     throw new Error('mongo uri is not properly defined')
  }

  try {
      await mongoose.connect(process.env.MONGO_URI ,{
           useNewUrlParser: true,
           useUnifiedTopology: true,
           useCreateIndex: true
      });
  }
  catch (err) {
      console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!!!");
  });
};

start();
